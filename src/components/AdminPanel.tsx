import React, { useState } from 'react';
import {
  ShieldCheck, LogOut, Package, CalendarCheck, Users, MapPin, Database,
  Plus, Trash2, Pause, Play, CheckCircle2, XCircle, RefreshCw, Copy, Check, ExternalLink, AlertCircle,
  Activity, Radio, Clock, UserCheck, Car, Search, Filter
} from 'lucide-react';
import { Vehicle, Branch, Client, Reservation, ReservationStatus, Language, VehicleType, TransmissionType, FuelType, ClientMovement } from '../types';
import { t, translateValue } from '../services/i18n';
import { getSheetsUrl, setSheetsUrl, testSheetsConnection, OFFICIAL_APPS_SCRIPT_CODE } from '../services/sheetsService';
import { useToast } from './Toast';

interface AdminPanelProps {
  isAdmin: boolean;
  onLogin: (u: string, p: string) => boolean;
  onLogout: () => void;
  vehicles: Vehicle[];
  branches: Branch[];
  clients: Client[];
  reservations: Reservation[];
  movements: ClientMovement[];
  isRealtimeConnected: boolean;
  lang: Language;
  onAddVehicle: (v: Omit<Vehicle, 'id'>) => void;
  onDeleteVehicle: (id: string) => void;
  onTogglePauseVehicle: (id: string) => void;
  onAdjustStock: (id: string, delta: number) => void;
  onUpdateReservationStatus: (id: string, status: ReservationStatus) => void;
  onAddBranch: (b: Omit<Branch, 'id'>) => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isAdmin,
  onLogin,
  onLogout,
  vehicles,
  branches,
  clients,
  reservations,
  movements,
  isRealtimeConnected,
  lang,
  onAddVehicle,
  onDeleteVehicle,
  onTogglePauseVehicle,
  onAdjustStock,
  onUpdateReservationStatus,
  onAddBranch,
  onRefreshData
}) => {
  const toast = useToast();

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active admin tab: 'movements' | 'inventory' | 'trips' | 'clients' | 'branches' | 'sheets'
  const [activeTab, setActiveTab] = useState<'movements' | 'inventory' | 'trips' | 'clients' | 'branches' | 'sheets'>('movements');

  // Movements filter & search
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');
  const [movementSearch, setMovementSearch] = useState<string>('');

  // Sheets configuration state
  const [sheetsUrlInput, setSheetsUrlInput] = useState<string>(getSheetsUrl());
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Filter for trips
  const [tripStatusFilter, setTripStatusFilter] = useState<string>('all');

  // Modal for new vehicle
  const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);
  const [newBrand, setNewBrand] = useState('Toyota');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VehicleType>('SUV');
  const [newTransmission, setNewTransmission] = useState<TransmissionType>('Automático');
  const [newFuel, setNewFuel] = useState<FuelType>('Gasolina');
  const [newPassengers, setNewPassengers] = useState(5);
  const [newPrice, setNewPrice] = useState(50);
  const [newStock, setNewStock] = useState(3);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Modal for new branch
  const [showAddBranchModal, setShowAddBranchModal] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('+503 ');
  const [newBranchHours, setNewBranchHours] = useState('08:00 AM - 06:00 PM');
  const [newBranchLat, setNewBranchLat] = useState(13.69);
  const [newBranchLng, setNewBranchLng] = useState(-89.22);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setLoginError(lang === 'es' ? 'Usuario o contraseña incorrectos' : 'Invalid username or password');
    } else {
      setLoginError('');
      toast.success(lang === 'es' ? 'Sesión de administrador iniciada' : 'Admin session started');
    }
  };

  // Handle Save Sheets URL
  const handleSaveSheetsUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setSheetsUrl(sheetsUrlInput);
    toast.success(
      lang === 'es' ? 'URL de Google Sheets guardada' : 'Google Sheets URL saved',
      lang === 'es' ? 'Las próximas reservas y clientes se enviarán a este Web App.' : 'Future bookings and clients will sync to this endpoint.'
    );
  };

  // Test Sheets Connection
  const handleTestSheets = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testSheetsConnection(sheetsUrlInput);
      setTestResult(res);
      if (res.success) {
        toast.success('Conexión exitosa', res.message);
      } else {
        toast.warning('Aviso de conexión', res.message);
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message });
      toast.error('Error al probar conexión', e.message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Copy Code.gs
  const handleCopyCode = () => {
    navigator.clipboard.writeText(OFFICIAL_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    toast.info(lang === 'es' ? 'Código copiado al portapapeles' : 'Code copied to clipboard');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Handle Add Vehicle Form
  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.warning('Ingresa el nombre del modelo');
      return;
    }

    onAddVehicle({
      brand: newBrand,
      name: newName,
      type: newType,
      transmission: newTransmission,
      fuel: newFuel,
      passengers: Number(newPassengers),
      pricePerDay: Number(newPrice),
      stock: Number(newStock),
      paused: false,
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    });

    toast.success(lang === 'es' ? 'Vehículo agregado a la flota' : 'Vehicle added to fleet');
    setShowAddVehicleModal(false);
    setNewName('');
    setNewImageUrl('');
  };

  // Handle Add Branch Form
  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchAddress.trim()) {
      toast.warning('Ingresa el nombre y la dirección de la sucursal');
      return;
    }

    onAddBranch({
      name: newBranchName,
      address: newBranchAddress,
      phone: newBranchPhone,
      hours: newBranchHours,
      lat: Number(newBranchLat),
      lng: Number(newBranchLng)
    });

    toast.success(lang === 'es' ? 'Sucursal creada' : 'Branch created');
    setShowAddBranchModal(false);
    setNewBranchName('');
    setNewBranchAddress('');
  };

  // Calculate KPIs
  const totalRevenue = reservations.reduce((sum, r) => sum + r.total, 0);
  const activeVehiclesCount = vehicles.filter(v => !v.paused).length;
  const totalStockUnits = vehicles.reduce((sum, v) => sum + v.stock, 0);
  const activeTripsCount = reservations.filter(r => r.status === 'en_curso').length;

  // Filtered trips
  const filteredReservations = reservations.filter(r => {
    if (tripStatusFilter === 'all') return true;
    return r.status === tripStatusFilter;
  });

  // Not logged in view: Login Card
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-stone-100 text-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-amber-700" />
          </div>

          <h1 className="font-serif text-2xl font-bold text-stone-900">
            {t('admin.login_title', lang)}
          </h1>
          <p className="mt-1.5 text-xs text-stone-500 font-mono">
            {t('admin.login_desc', lang)}
          </p>

          {loginError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="mt-6 text-left space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                {t('admin.user', lang)}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                {t('admin.pass', lang)}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer shadow-md"
            >
              {t('admin.login_btn', lang)}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Top Header & Logout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
              Trip Now · Operaciones El Salvador
            </span>
            <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Sesión Activa
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {lang === 'es' ? 'Panel de Control y Operaciones' : 'Operations Management Console'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshData}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-stone-500" />
            <span>{t('admin.logout_btn', lang)}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-mono text-stone-500 block uppercase">Ingresos Totales</span>
          <div className="font-serif text-2xl font-bold text-stone-900 mt-1 font-mono">
            ${totalRevenue} <span className="text-xs font-normal text-stone-500">USD</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-mono text-stone-500 block uppercase">Modelos en Flota</span>
          <div className="font-serif text-2xl font-bold text-stone-900 mt-1 font-mono">
            {activeVehiclesCount} <span className="text-xs font-normal text-stone-500">activos</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-mono text-stone-500 block uppercase">Stock Disponible</span>
          <div className="font-serif text-2xl font-bold text-stone-900 mt-1 font-mono">
            {totalStockUnits} <span className="text-xs font-normal text-stone-500">unidades</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-mono text-stone-500 block uppercase">Viajes en Curso</span>
          <div className="font-serif text-2xl font-bold text-amber-700 mt-1 font-mono">
            {activeTripsCount}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[11px] font-mono text-stone-500 block uppercase">Clientes Registrados</span>
          <div className="font-serif text-2xl font-bold text-stone-900 mt-1 font-mono">
            {clients.length}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 scrollbar-none">
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'movements' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{lang === 'es' ? 'Movimientos en Tiempo Real' : 'Real-Time Movements'}</span>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRealtimeConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          {movements.length > 0 && (
            <span className="bg-stone-800 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-stone-700">
              {movements.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'inventory' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>{t('admin.tab.inventory', lang)}</span>
        </button>

        <button
          onClick={() => setActiveTab('trips')}
          className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'trips' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>{t('admin.tab.trips', lang)}</span>
          {activeTripsCount > 0 && (
            <span className="bg-amber-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full">
              {activeTripsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'clients' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('admin.tab.clients', lang)}</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'branches' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{t('admin.tab.branches', lang)}</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sheets' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{t('admin.tab.sheets', lang)}</span>
        </button>
      </div>

      {/* TAB 1: INVENTARIO */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {lang === 'es' ? 'Flota de Vehículos y Stock en Tiempo Real' : 'Vehicle Fleet & Real-Time Stock'}
            </h2>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('admin.inv.add_btn', lang)}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase">
                  <tr>
                    <th className="p-4">{t('admin.inv.model', lang)}</th>
                    <th className="p-4">{t('admin.inv.type', lang)}</th>
                    <th className="p-4">{t('admin.inv.price', lang)}</th>
                    <th className="p-4 text-center">{t('admin.inv.stock', lang)}</th>
                    <th className="p-4">{t('admin.inv.status', lang)}</th>
                    <th className="p-4 text-right">{t('admin.inv.actions', lang)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {vehicles.map(v => (
                    <tr key={v.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.imageUrl}
                            alt={v.name}
                            className="w-10 h-8 rounded object-cover bg-stone-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block font-sans">{v.brand} {v.name}</span>
                            <span className="text-[11px] text-stone-500">{v.transmission} · {v.fuel}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-sans text-stone-700">{v.type}</td>
                      <td className="p-4 font-bold text-stone-900">${v.pricePerDay} USD</td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-lg">
                          <button
                            onClick={() => onAdjustStock(v.id, -1)}
                            className="hover:bg-stone-200 px-1 rounded font-bold cursor-pointer"
                            title="Restar 1 de stock"
                          >
                            -
                          </button>
                          <span className="font-bold min-w-[20px]">{v.stock}</span>
                          <button
                            onClick={() => onAdjustStock(v.id, 1)}
                            className="hover:bg-stone-200 px-1 rounded font-bold cursor-pointer"
                            title="Sumar 1 de stock"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {v.paused ? (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            {t('admin.inv.paused', lang)}
                          </span>
                        ) : (
                          <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            {t('admin.inv.active', lang)}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onTogglePauseVehicle(v.id)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                            title={v.paused ? t('admin.inv.resume_btn', lang) : t('admin.inv.pause_btn', lang)}
                          >
                            {v.paused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
                          </button>

                          <button
                            onClick={() => onDeleteVehicle(v.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title={t('admin.inv.delete_btn', lang)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIAJES Y RESERVAS (Active UI to finalize/cancel trips and release stock) */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                {lang === 'es' ? 'Gestión de Viajes y Reservas' : 'Trips & Bookings Management'}
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                Al finalizar o cancelar un viaje, el stock del vehículo se libera automáticamente en el inventario.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-500">Filtrar:</span>
              <select
                value={tripStatusFilter}
                onChange={(e) => setTripStatusFilter(e.target.value)}
                className="text-xs font-mono bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800"
              >
                <option value="all">Todos los estados</option>
                <option value="en_curso">En curso</option>
                <option value="finalizado">Finalizados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase">
                  <tr>
                    <th className="p-4">{t('admin.trips.id', lang)}</th>
                    <th className="p-4">{t('admin.trips.client', lang)}</th>
                    <th className="p-4">{t('admin.trips.vehicle', lang)}</th>
                    <th className="p-4">{t('admin.trips.dates', lang)}</th>
                    <th className="p-4">{t('admin.trips.branch', lang)}</th>
                    <th className="p-4">{t('admin.trips.total', lang)}</th>
                    <th className="p-4">{t('admin.trips.status', lang)}</th>
                    <th className="p-4 text-right">Gestión de Retorno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-500">
                        No hay reservas registradas con este filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map(r => (
                      <tr key={r.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-4 font-bold text-stone-900">{r.id}</td>
                        <td className="p-4">
                          <span className="font-bold text-stone-900 block font-sans">{r.clientName}</span>
                          <span className="text-[11px] text-stone-500">{r.clientEmail}</span>
                        </td>
                        <td className="p-4 font-sans text-stone-800">{r.vehicleName}</td>
                        <td className="p-4 text-[11px]">
                          <div>{r.pickupDate} &rarr; {r.returnDate}</div>
                          <div className="text-stone-500">({r.days} d)</div>
                        </td>
                        <td className="p-4 font-sans text-stone-700 max-w-[160px] truncate" title={r.branchName}>
                          {r.branchName}
                        </td>
                        <td className="p-4 font-bold text-stone-900">${r.total} USD</td>
                        <td className="p-4">
                          {r.status === 'en_curso' && (
                            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                              {t('admin.trips.status_en_curso', lang)}
                            </span>
                          )}
                          {r.status === 'finalizado' && (
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              {t('admin.trips.status_finalizado', lang)}
                            </span>
                          )}
                          {r.status === 'cancelado' && (
                            <span className="text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                              {t('admin.trips.status_cancelado', lang)}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {r.status === 'en_curso' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(r.id, 'finalizado');
                                  toast.success('Viaje finalizado', 'Stock restaurado +1 y sincronizado.');
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] transition-colors cursor-pointer"
                                title="Finalizar viaje y devolver unidad al stock"
                              >
                                Finalizar (Liberar)
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateReservationStatus(r.id, 'cancelado');
                                  toast.info('Viaje cancelado', 'Stock restaurado +1 en inventario.');
                                }}
                                className="px-2 py-1 bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 rounded text-[11px] transition-colors cursor-pointer"
                                title="Cancelar reserva"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <span className="text-stone-400 text-[11px]">Cerrado</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLIENTES */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {lang === 'es' ? 'Directorio de Clientes' : 'Client Directory'}
            </h2>
            <span className="text-xs font-mono text-stone-500">
              {clients.length} clientes en base de datos local
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Nombre y Teléfono</th>
                    <th className="p-4">Correo Electrónico</th>
                    <th className="p-4 text-center">Reservas</th>
                    <th className="p-4 text-right">Gasto Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-4 font-bold text-stone-900">{c.id}</td>
                      <td className="p-4">
                        <span className="font-bold text-stone-900 block font-sans">{c.nombre}</span>
                        <span className="text-[11px] text-stone-500">{c.telefono}</span>
                      </td>
                      <td className="p-4 text-stone-700">{c.email}</td>
                      <td className="p-4 text-center font-bold">{c.reservas}</td>
                      <td className="p-4 text-right font-bold text-stone-900">${c.gastoTotal} USD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUCURSALES */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {lang === 'es' ? 'Sucursales en El Salvador' : 'Branches in El Salvador'}
            </h2>
            <button
              onClick={() => setShowAddBranchModal(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'es' ? '+ Nueva Sucursal' : '+ New Branch'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-stone-900">{b.name}</h3>
                    <span className="text-[10px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">{b.id}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-600">{b.address}</p>
                  <div className="mt-3 text-xs font-mono text-stone-500 space-y-1">
                    <div>📞 {b.phone}</div>
                    <div>🕒 {b.hours}</div>
                    <div>📍 Lat: {b.lat}, Lng: {b.lng}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GOOGLE SHEETS API INTEGRATION */}
      {activeTab === 'sheets' && (
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {lang === 'es' ? 'Configuración de Backend Google Sheets & Apps Script' : 'Google Sheets & Apps Script Bridge'}
            </h2>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Conexión directa vía endpoint HTTP POST/GET (ContentService JSON). Permite almacenar Clientes y Viajes en tiempo real.
            </p>
          </div>

          {/* Webhook URL Input & Test */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">
              Endpoint del Web App (Google Apps Script)
            </h3>
            
            <form onSubmit={handleSaveSheetsUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-stone-600 mb-1">
                  URL del Web App (terminada en /exec):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={sheetsUrlInput}
                    onChange={(e) => setSheetsUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Guardar URL
                  </button>
                  <button
                    type="button"
                    onClick={handleTestSheets}
                    disabled={isTestingConnection || !sheetsUrlInput}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                    <span>Probar Conexión (Ping)</span>
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                  <div>
                    <span className="font-bold">{testResult.success ? 'Conexión verificada:' : 'Fallo en la prueba:'}</span>
                    <p className="mt-0.5">{testResult.message}</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Code.gs Viewer & Instructions */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Código de Backend Oficial (Code.gs)
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  Pega este código en Google Apps Script para auto-crear las hojas "Clientes" y "Viajes".
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar Code.gs'}</span>
              </button>
            </div>

            <pre className="p-4 bg-stone-900 text-stone-200 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-stone-800 leading-relaxed scrollbar-thin">
              {OFFICIAL_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* TAB: MOVIMIENTOS EN TIEMPO REAL (FIRESTORE) */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          {/* Header & Status Indicator */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
                  Firebase Firestore · Live Stream
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                  isRealtimeConnected 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isRealtimeConnected ? 'Base de Datos Conectada en Vivo' : 'Conectando a Firestore...'}
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                {lang === 'es' ? 'Monitoreo de Movimientos de Clientes' : 'Real-Time Customer Activity Stream'}
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                {lang === 'es'
                  ? 'Cada reserva, registro o cambio de estado de clientes se sincroniza y muestra aquí instantáneamente.'
                  : 'Every booking, customer signup, and reservation update syncs and appears here in real time.'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-stone-500 block uppercase">Total Eventos en Vivo</span>
              <span className="font-serif text-2xl font-bold text-stone-900 font-mono">{movements.length}</span>
            </div>
          </div>

          {/* Quick Metrics of Movements */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-mono">
              <span className="text-stone-500 block">RESERVAS EMITIDAS</span>
              <span className="font-bold text-lg text-stone-900 mt-0.5 block">
                {movements.filter(m => m.type === 'reserva_creada').length}
              </span>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-mono">
              <span className="text-stone-500 block">CLIENTES REGISTRADOS</span>
              <span className="font-bold text-lg text-stone-900 mt-0.5 block">
                {movements.filter(m => m.type === 'cliente_registrado').length}
              </span>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-mono">
              <span className="text-stone-500 block">VIAJES FINALIZADOS</span>
              <span className="font-bold text-lg text-emerald-700 mt-0.5 block">
                {movements.filter(m => m.type === 'viaje_finalizado').length}
              </span>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-mono">
              <span className="text-stone-500 block">VIAJES CANCELADOS</span>
              <span className="font-bold text-lg text-rose-700 mt-0.5 block">
                {movements.filter(m => m.type === 'viaje_cancelado').length}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={movementSearch}
                onChange={(e) => setMovementSearch(e.target.value)}
                placeholder={lang === 'es' ? 'Buscar por cliente, correo o vehículo...' : 'Search by client, email, vehicle...'}
                className="w-full text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
                className="text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
              >
                <option value="all">{lang === 'es' ? 'Todos los movimientos' : 'All activities'}</option>
                <option value="reserva_creada">{lang === 'es' ? 'Nuevas Reservas' : 'New Bookings'}</option>
                <option value="cliente_registrado">{lang === 'es' ? 'Clientes Registrados' : 'Client Signups'}</option>
                <option value="viaje_finalizado">{lang === 'es' ? 'Viajes Finalizados' : 'Completed Trips'}</option>
                <option value="viaje_cancelado">{lang === 'es' ? 'Viajes Cancelados' : 'Canceled Trips'}</option>
              </select>
            </div>
          </div>

          {/* Live Feed Stream */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-mono text-stone-500">
              <span className="font-bold text-stone-700 uppercase">Flujo en Tiempo Real (Firestore Stream)</span>
              <span>Ordenado por más reciente</span>
            </div>

            {movements.filter(m => {
              if (movementTypeFilter !== 'all' && m.type !== movementTypeFilter) return false;
              if (movementSearch.trim()) {
                const s = movementSearch.toLowerCase();
                const matchName = m.clientName.toLowerCase().includes(s);
                const matchEmail = m.clientEmail.toLowerCase().includes(s);
                const matchDetails = m.details.toLowerCase().includes(s);
                const matchVeh = m.vehicleName?.toLowerCase().includes(s);
                if (!matchName && !matchEmail && !matchDetails && !matchVeh) return false;
              }
              return true;
            }).length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-stone-500 space-y-2">
                <Activity className="w-8 h-8 text-stone-300 mx-auto" />
                <p>No hay movimientos registrados que coincidan con el filtro.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {movements
                  .filter(m => {
                    if (movementTypeFilter !== 'all' && m.type !== movementTypeFilter) return false;
                    if (movementSearch.trim()) {
                      const s = movementSearch.toLowerCase();
                      const matchName = m.clientName.toLowerCase().includes(s);
                      const matchEmail = m.clientEmail.toLowerCase().includes(s);
                      const matchDetails = m.details.toLowerCase().includes(s);
                      const matchVeh = m.vehicleName?.toLowerCase().includes(s);
                      if (!matchName && !matchEmail && !matchDetails && !matchVeh) return false;
                    }
                    return true;
                  })
                  .map((m) => {
                    const formattedTime = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const formattedDate = new Date(m.timestamp).toLocaleDateString();

                    return (
                      <div key={m.id} className="p-4 sm:p-5 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            m.type === 'reserva_creada'
                              ? 'bg-amber-100 text-amber-700'
                              : m.type === 'cliente_registrado'
                              ? 'bg-blue-100 text-blue-700'
                              : m.type === 'viaje_finalizado'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {m.type === 'reserva_creada' && <Car className="w-4 h-4" />}
                            {m.type === 'cliente_registrado' && <UserCheck className="w-4 h-4" />}
                            {m.type === 'viaje_finalizado' && <CheckCircle2 className="w-4 h-4" />}
                            {m.type === 'viaje_cancelado' && <XCircle className="w-4 h-4" />}
                            {m.type === 'stock_ajustado' && <RefreshCw className="w-4 h-4" />}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-stone-900 text-xs sm:text-sm">
                                {m.clientName}
                              </span>
                              <span className="text-[11px] font-mono text-stone-500">
                                ({m.clientEmail})
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                                m.type === 'reserva_creada'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : m.type === 'cliente_registrado'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : m.type === 'viaje_finalizado'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}>
                                {m.type === 'reserva_creada' && 'Nueva Reserva'}
                                {m.type === 'cliente_registrado' && 'Registro de Cliente'}
                                {m.type === 'viaje_finalizado' && 'Viaje Finalizado'}
                                {m.type === 'viaje_cancelado' && 'Viaje Cancelado'}
                                {m.type === 'stock_ajustado' && 'Ajuste de Stock'}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-stone-700 leading-relaxed font-sans">
                              {m.details}
                            </p>

                            <div className="mt-1.5 flex items-center gap-3 text-[11px] font-mono text-stone-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formattedTime} · {formattedDate}
                              </span>
                              {m.branchName && (
                                <>
                                  <span>·</span>
                                  <span>{m.branchName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {m.amount !== undefined && (
                          <div className="sm:text-right shrink-0">
                            <span className="text-[10px] font-mono text-stone-500 uppercase block">Monto</span>
                            <span className="font-serif text-base sm:text-lg font-bold text-stone-900 font-mono">
                              ${m.amount} USD
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Vehicle */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
              Agregar Nuevo Vehículo a la Flota
            </h3>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Marca:</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Toyota, Ford, Nissan..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Modelo:</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Hilux, RAV4, Corolla..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Tipo:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 font-sans"
                  >
                    <option value="Camioneta">Camioneta</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedán">Sedán</option>
                    <option value="Compacto">Compacto</option>
                    <option value="Motocicleta">Motocicleta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Transmisión:</label>
                  <select
                    value={newTransmission}
                    onChange={(e) => setNewTransmission(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 font-sans"
                  >
                    <option value="Automático">Automático</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Combustible:</label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 font-sans"
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Pasajeros:</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newPassengers}
                    onChange={(e) => setNewPassengers(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Precio/Día ($):</label>
                  <input
                    type="number"
                    min={10}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Stock inicial:</label>
                  <input
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1">URL de Imagen (Opcional):</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://... o dejar vacío para fallback"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium cursor-pointer"
                >
                  Guardar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Branch */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
              Agregar Nueva Sucursal
            </h3>

            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-stone-600 mb-1">Nombre de la sucursal:</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Ej: Usulután Centro"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Dirección completa:</label>
                <input
                  type="text"
                  required
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="Calle principal, Plaza comercial..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Teléfono:</label>
                  <input
                    type="text"
                    required
                    value={newBranchPhone}
                    onChange={(e) => setNewBranchPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Horario:</label>
                  <input
                    type="text"
                    required
                    value={newBranchHours}
                    onChange={(e) => setNewBranchHours(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Latitud (aprox):</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBranchLat}
                    onChange={(e) => setNewBranchLat(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Longitud (aprox):</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBranchLng}
                    onChange={(e) => setNewBranchLng(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium cursor-pointer"
                >
                  Guardar Sucursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
