/**
 * Google Apps Script Web App Client for Trip Now
 * Integrates with Google Sheets using POST (text/plain to prevent CORS preflight)
 */

import { Client, Reservation } from '../types';

const SHEETS_URL_STORAGE_KEY = 'tripnow_sheets_url';

// Default mock or fallback URL if user hasn't deployed their own script yet
export const getSheetsUrl = (): string => {
  return localStorage.getItem(SHEETS_URL_STORAGE_KEY) || '';
};

export const setSheetsUrl = (url: string): void => {
  localStorage.setItem(SHEETS_URL_STORAGE_KEY, url.trim());
};

export interface SheetResponse {
  ok: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Register client in Google Sheet (Hoja "Clientes")
 */
export async function sheetRegisterClient(profile: { nombre: string; email: string; telefono: string }): Promise<SheetResponse> {
  const url = getSheetsUrl();
  const payload = {
    action: 'registrar_cliente',
    nombre: profile.nombre,
    email: profile.email.toLowerCase().trim(),
    telefono: profile.telefono
  };

  if (!url) {
    console.warn('[Trip Now - Sheets] No WebApp URL configured. Skipping remote sync.');
    return { ok: true, message: 'Simulado localmente (sin URL de Sheets configurada)' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    console.error('[Trip Now - Sheets] Error al registrar cliente:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Create trip in Google Sheet (Hoja "Viajes")
 */
export async function sheetCreateTrip(reservation: Reservation): Promise<SheetResponse> {
  const url = getSheetsUrl();
  const payload = {
    action: 'crear_viaje',
    id: reservation.id,
    clientName: reservation.clientName,
    clientEmail: reservation.clientEmail.toLowerCase().trim(),
    vehicleId: reservation.vehicleId,
    vehicleName: reservation.vehicleName,
    days: reservation.days,
    pickupDate: reservation.pickupDate,
    returnDate: reservation.returnDate,
    branchId: reservation.branchId,
    branchName: reservation.branchName,
    total: reservation.total
  };

  if (!url) {
    console.warn('[Trip Now - Sheets] No WebApp URL configured. Stored locally only.');
    return { ok: true, message: 'Guardado en almacenamiento local (sin URL de Sheets)' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    console.error('[Trip Now - Sheets] Error al crear viaje:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Update trip status in Google Sheet (Hoja "Viajes")
 */
export async function sheetUpdateTripStatus(id: string, status: string): Promise<SheetResponse> {
  const url = getSheetsUrl();
  const payload = {
    action: 'actualizar_viaje',
    id,
    status
  };

  if (!url) {
    console.warn('[Trip Now - Sheets] No WebApp URL configured. Status updated locally.');
    return { ok: true, message: 'Estado actualizado en almacenamiento local' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    console.error('[Trip Now - Sheets] Error al actualizar estado de viaje:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Test connectivity with Apps Script Web App
 */
export async function testSheetsConnection(testUrl?: string): Promise<{ success: boolean; latencyMs?: number; message: string }> {
  const targetUrl = testUrl || getSheetsUrl();
  if (!targetUrl) {
    return { success: false, message: 'Ingresa la URL del Web App de Google Apps Script primero.' };
  }

  const start = Date.now();
  try {
    // Try pinging doGet
    const res = await fetch(`${targetUrl}?resource=ping`, { method: 'GET' });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { success: true, latencyMs, message: `Conexión exitosa con Google Apps Script (${latencyMs}ms).` };
    }
    return { success: false, message: `El servidor respondió con código HTTP ${res.status}.` };
  } catch (err: any) {
    // Some Apps Script endpoints redirect, or don't handle GET resource=ping, let's test a light POST
    try {
      const postRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping' })
      });
      const latencyMs = Date.now() - start;
      return { success: true, latencyMs, message: `Conexión POST exitosa con Google Apps Script (${latencyMs}ms).` };
    } catch (e: any) {
      return { success: false, message: `No se pudo conectar: ${err.message}. Verifica que el Web App esté publicado con acceso "Cualquiera" (Anyone).` };
    }
  }
}

/**
 * Official Google Apps Script Code.gs ready to copy or download
 */
export const OFFICIAL_APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * BACKEND GOOGLE APPS SCRIPT — TRIP NOW (EL SALVADOR)
 * ====================================================================
 * Instrucciones:
 * 1. Abre tu hoja de Google Sheets (o crea una nueva: sheets.new).
 * 2. Ve al menú Extensiones > Apps Script.
 * 3. Pega este código completo en Code.gs reemplazando todo.
 * 4. Haz clic en "Implementar" (Deploy) > "Nueva implementación".
 * 5. Selecciona Tipo: "Aplicación web".
 * 6. Configura:
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquiera" (Anyone) -> IMPRESCINDIBLE
 * 7. Copia la URL del Web App (termina en /exec) y pégala en Trip Now.
 */

function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (sheetName === "Clientes") {
      sheet.appendRow(["ID", "Nombre", "Email", "Teléfono", "Reservas", "Gasto total", "Registrado el"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#1C2738").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    } else if (sheetName === "Viajes") {
      sheet.appendRow(["ID", "Cliente", "Email", "Vehículo", "Días", "Fecha recogida", "Fecha devolución", "Sucursal", "Total", "Estado", "Creado el"]);
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#1C2738").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var action = data.action;

    if (action === "ping") {
      return respondJSON({ ok: true, status: "pong", timestamp: new Date().toISOString() });
    }

    if (action === "registrar_cliente") {
      var sheet = getSheet("Clientes");
      var values = sheet.getDataRange().getValues();
      var emailBuscado = (data.email || "").toString().toLowerCase().trim();
      var foundRow = -1;

      for (var i = 1; i < values.length; i++) {
        var rowEmail = (values[i][2] || "").toString().toLowerCase().trim();
        if (rowEmail === emailBuscado) {
          foundRow = i + 1; // 1-indexed
          break;
        }
      }

      var nowStr = new Date().toISOString();
      if (foundRow > 0) {
        // Actualizar datos de contacto si cambiaron
        sheet.getRange(foundRow, 2).setValue(data.nombre);
        sheet.getRange(foundRow, 4).setValue(data.telefono);
        return respondJSON({ ok: true, action: "cliente_actualizado", email: emailBuscado });
      } else {
        var clientId = "c_" + Date.now();
        sheet.appendRow([clientId, data.nombre, emailBuscado, data.telefono, 0, 0, nowStr]);
        return respondJSON({ ok: true, action: "cliente_registrado", id: clientId, email: emailBuscado });
      }
    }

    if (action === "crear_viaje") {
      var viajesSheet = getSheet("Viajes");
      var tripId = data.id || ("r_" + Date.now());
      var nowStr = new Date().toISOString();

      viajesSheet.appendRow([
        tripId,
        data.clientName,
        data.clientEmail,
        data.vehicleName,
        data.days,
        data.pickupDate,
        data.returnDate,
        data.branchName,
        data.total,
        "En curso",
        nowStr
      ]);

      // Incrementar contador de reservas y gasto en hoja Clientes
      var clientesSheet = getSheet("Clientes");
      var cValues = clientesSheet.getDataRange().getValues();
      var clientEmail = (data.clientEmail || "").toString().toLowerCase().trim();
      
      for (var j = 1; j < cValues.length; j++) {
        if ((cValues[j][2] || "").toString().toLowerCase().trim() === clientEmail) {
          var row = j + 1;
          var curReservas = Number(cValues[j][4]) || 0;
          var curGasto = Number(cValues[j][5]) || 0;
          clientesSheet.getRange(row, 5).setValue(curReservas + 1);
          clientesSheet.getRange(row, 6).setValue(curGasto + Number(data.total || 0));
          break;
        }
      }

      return respondJSON({ ok: true, action: "viaje_creado", id: tripId });
    }

    if (action === "actualizar_viaje") {
      var sheet = getSheet("Viajes");
      var values = sheet.getDataRange().getValues();
      var tripId = (data.id || "").toString();
      var newStatus = data.status || "finalizado";

      for (var k = 1; k < values.length; k++) {
        if ((values[k][0] || "").toString() === tripId) {
          sheet.getRange(k + 1, 10).setValue(newStatus);
          return respondJSON({ ok: true, action: "viaje_actualizado", id: tripId, status: newStatus });
        }
      }
      return respondJSON({ ok: false, error: "Viaje no encontrado con ID " + tripId });
    }

    return respondJSON({ ok: false, error: "Acción desconocida: " + action });
  } catch (error) {
    return respondJSON({ ok: false, error: error.toString() });
  }
}

function doGet(e) {
  var resource = (e && e.parameter && e.parameter.resource) || "clientes";
  try {
    if (resource === "ping") {
      return respondJSON({ ok: true, status: "pong", timestamp: new Date().toISOString() });
    }

    var sheetName = resource === "viajes" ? "Viajes" : "Clientes";
    var sheet = getSheet(sheetName);
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return respondJSON([]);
    }

    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      for (var h = 0; h < headers.length; h++) {
        rowObj[headers[h]] = data[i][h];
      }
      rows.push(rowObj);
    }
    return respondJSON(rows);
  } catch (error) {
    return respondJSON({ ok: false, error: error.toString() });
  }
}

function respondJSON(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
