import { Language } from '../types';

export const DICTIONARY: Record<Language, Record<string, string>> = {
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.catalog': 'Catálogo',
    'nav.branches': 'Sucursales',
    'nav.cart': 'Carrito',
    'nav.login': 'Identificarse',
    'nav.account': 'Mi Cuenta',
    'nav.logout': 'Cerrar Sesión',
    'nav.admin': 'Panel Admin',
    'nav.audit': 'Arquitectura & Docs',

    // Hero
    'hero.badge': 'El Salvador · Flota Moderna 2026',
    'hero.title': 'Explora El Salvador con la máxima libertad',
    'hero.subtitle': 'Arrendamiento ágil de vehículos para playas de Surf City, volcanes y negocios en San Salvador. Entrega inmediata en el Aeropuerto Internacional.',
    'hero.btn.explore': 'Ver Catálogo Completo',
    'hero.btn.branches': 'Ver Sucursales',
    'hero.trust.airpot': 'Recogida 24/7 en Aeropuerto (SAL)',
    'hero.trust.insurance': 'Seguro con cobertura local',
    'hero.trust.unlimited': 'Kilometraje sin límite disponible',

    // Quick Search Widget
    'search.pickup_branch': 'Sucursal de recogida',
    'search.pickup_date': 'Fecha de salida',
    'search.days': 'Días estimados',
    'search.btn': 'Buscar Disponibilidad',

    // Catalog
    'catalog.title': 'Catálogo de Vehículos Disponibles',
    'catalog.subtitle': 'Unidades verificadas en tiempo real. Selecciona el número de días para calcular tu tarifa al instante.',
    'catalog.filter.all': 'Todos los tipos',
    'catalog.filter.Camioneta': 'Camionetas 4x4',
    'catalog.filter.SUV': 'SUVs Familiares',
    'catalog.filter.Sedán': 'Sedanes Ejecutivos',
    'catalog.filter.Compacto': 'Compactos Urbanos',
    'catalog.filter.Motocicleta': 'Motocicletas',
    'catalog.filter.transmission': 'Transmisión',
    'catalog.filter.fuel': 'Combustible',
    'catalog.filter.passengers': 'Pasajeros mínimos',
    'catalog.filter.search_placeholder': 'Buscar por modelo (ej. Hilux, RAV4, Corolla)...',
    'catalog.empty': 'No encontramos vehículos con los filtros seleccionados.',
    'catalog.stock_left': 'unidades disponibles',
    'catalog.out_of_stock': 'Agotado temporalmente',
    'catalog.paused': 'En mantenimiento / Pausado',
    'catalog.price_per_day': '/ día',
    'catalog.days_selector': 'Días de alquiler:',
    'catalog.total_calc': 'Total estimado:',
    'catalog.btn.add': 'Agregar al Carrito',
    'catalog.btn.reserve_now': 'Reservar Ahora',

    // Cart
    'cart.title': 'Tu Carrito de Arrendamiento',
    'cart.subtitle': 'Revisa tus vehículos seleccionados, asigna fecha de salida y sucursal de entrega.',
    'cart.empty_title': 'Tu carrito está vacío',
    'cart.empty_desc': 'Explora nuestro catálogo y agrega vehículos para tu próxima aventura o viaje en El Salvador.',
    'cart.empty_btn': 'Ir al Catálogo',
    'cart.item_days': 'Días',
    'cart.subtotal': 'Subtotal',
    'cart.branch_label': 'Sucursal de retiro obligatoria',
    'cart.date_label': 'Fecha de recogida',
    'cart.return_date': 'Fecha calculada de devolución:',
    'cart.client_details': 'Datos de contacto para la reserva',
    'cart.name_placeholder': 'Tu nombre y apellido',
    'cart.email_placeholder': 'tu.correo@ejemplo.com',
    'cart.phone_placeholder': '+503 7000-0000',
    'cart.btn.confirm': 'Confirmar Reserva en Firme',
    'cart.success_title': '¡Reserva Confirmada con Éxito!',
    'cart.success_desc': 'Tu solicitud ha sido procesada y registrada en nuestra base de datos. Te esperamos en la sucursal asignada.',
    'cart.sync_badge': 'Sincronizado con Google Sheets',

    // Branches
    'branches.title': 'Nuestras Sucursales en El Salvador',
    'branches.subtitle': 'Puntos estratégicos para entrega y devolución en todo el territorio nacional.',
    'branches.filter_label': 'Selecciona una sucursal para centrar el mapa interactivo:',
    'branches.hours': 'Horario de atención',
    'branches.phone': 'Contacto telefónico',
    'branches.btn.select': 'Retirar en esta sucursal',

    // Auth Modal
    'auth.title': 'Identificación de Cliente',
    'auth.desc': 'Accede para gestionar tus alquileres, historial y agilizar tus próximas confirmaciones.',
    'auth.name': 'Nombre completo',
    'auth.email': 'Correo electrónico',
    'auth.phone': 'Teléfono / WhatsApp',
    'auth.btn.save': 'Guardar y Continuar',
    'auth.btn.cancel': 'Cancelar',

    // Admin
    'admin.login_title': 'Acceso Administrativo',
    'admin.login_desc': 'Credenciales de demostración: admin / admin123',
    'admin.user': 'Usuario',
    'admin.pass': 'Contraseña',
    'admin.login_btn': 'Ingresar al Panel',
    'admin.logout_btn': 'Cerrar Sesión Admin',
    'admin.tab.inventory': 'Inventario y Stock',
    'admin.tab.trips': 'Viajes y Reservas',
    'admin.tab.clients': 'Clientes',
    'admin.tab.branches': 'Sucursales',
    'admin.tab.sheets': 'Google Sheets API',
    'admin.tab.audit': 'Auditoría Técnica',

    // Admin - Inventory
    'admin.inv.add_btn': '+ Nuevo Vehículo',
    'admin.inv.model': 'Modelo y Marca',
    'admin.inv.type': 'Tipo',
    'admin.inv.price': 'Precio/Día',
    'admin.inv.stock': 'Stock Actual',
    'admin.inv.status': 'Estado',
    'admin.inv.actions': 'Acciones',
    'admin.inv.active': 'Activo',
    'admin.inv.paused': 'Pausado',
    'admin.inv.pause_btn': 'Pausar',
    'admin.inv.resume_btn': 'Activar',
    'admin.inv.delete_btn': 'Eliminar',

    // Admin - Trips
    'admin.trips.id': 'Código',
    'admin.trips.client': 'Cliente',
    'admin.trips.vehicle': 'Vehículo',
    'admin.trips.dates': 'Fechas',
    'admin.trips.branch': 'Sucursal',
    'admin.trips.total': 'Total USD',
    'admin.trips.status': 'Estado',
    'admin.trips.btn_finish': 'Finalizar Viaje (Liberar Stock)',
    'admin.trips.btn_cancel': 'Cancelar (Restaurar Stock)',
    'admin.trips.status_en_curso': 'En curso',
    'admin.trips.status_finalizado': 'Finalizado',
    'admin.trips.status_cancelado': 'Cancelado',

    // General
    'common.currency': 'USD $',
    'common.passengers': 'pasajeros',
    'common.loading': 'Cargando...',
    'common.close': 'Cerrar'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.catalog': 'Fleet',
    'nav.branches': 'Locations',
    'nav.cart': 'Cart',
    'nav.login': 'Sign In',
    'nav.account': 'My Profile',
    'nav.logout': 'Sign Out',
    'nav.admin': 'Admin Panel',
    'nav.audit': 'Architecture & Docs',

    // Hero
    'hero.badge': 'El Salvador · Modern 2026 Fleet',
    'hero.title': 'Explore El Salvador with Total Freedom',
    'hero.subtitle': 'Agile car rental for Surf City beaches, volcanic trails, and San Salvador corporate travel. Immediate pickup at San Óscar Romero International Airport.',
    'hero.btn.explore': 'View Full Fleet',
    'hero.btn.branches': 'View Locations',
    'hero.trust.airpot': '24/7 Airport Pickup (SAL)',
    'hero.trust.insurance': 'Local Comprehensive Coverage',
    'hero.trust.unlimited': 'Unlimited Mileage Available',

    // Quick Search Widget
    'search.pickup_branch': 'Pickup Location',
    'search.pickup_date': 'Pickup Date',
    'search.days': 'Estimated Days',
    'search.btn': 'Check Availability',

    // Catalog
    'catalog.title': 'Available Vehicles Catalog',
    'catalog.subtitle': 'Real-time verified units. Adjust the number of rental days to calculate live rates immediately.',
    'catalog.filter.all': 'All Types',
    'catalog.filter.Camioneta': '4x4 Trucks',
    'catalog.filter.SUV': 'Family SUVs',
    'catalog.filter.Sedán': 'Executive Sedans',
    'catalog.filter.Compacto': 'City Compacts',
    'catalog.filter.Motocicleta': 'Motorcycles',
    'catalog.filter.transmission': 'Transmission',
    'catalog.filter.fuel': 'Fuel Type',
    'catalog.filter.passengers': 'Min Passengers',
    'catalog.filter.search_placeholder': 'Search by model (e.g. Hilux, RAV4, Corolla)...',
    'catalog.empty': 'No vehicles found matching the selected filters.',
    'catalog.stock_left': 'units available',
    'catalog.out_of_stock': 'Temporarily Out of Stock',
    'catalog.paused': 'Maintenance / Paused',
    'catalog.price_per_day': '/ day',
    'catalog.days_selector': 'Rental duration:',
    'catalog.total_calc': 'Estimated total:',
    'catalog.btn.add': 'Add to Cart',
    'catalog.btn.reserve_now': 'Book Now',

    // Cart
    'cart.title': 'Your Rental Cart',
    'cart.subtitle': 'Review your selected vehicles, set pickup date and branch location.',
    'cart.empty_title': 'Your cart is empty',
    'cart.empty_desc': 'Browse our catalog and pick vehicles for your next trip in El Salvador.',
    'cart.empty_btn': 'Go to Catalog',
    'cart.item_days': 'Days',
    'cart.subtotal': 'Subtotal',
    'cart.branch_label': 'Mandatory pickup branch',
    'cart.date_label': 'Pickup date',
    'cart.return_date': 'Calculated return date:',
    'cart.client_details': 'Contact information for reservation',
    'cart.name_placeholder': 'Your full name',
    'cart.email_placeholder': 'your.email@example.com',
    'cart.phone_placeholder': '+503 7000-0000',
    'cart.btn.confirm': 'Confirm Firm Reservation',
    'cart.success_title': 'Reservation Confirmed Successfully!',
    'cart.success_desc': 'Your booking has been registered in our database. We look forward to seeing you at the designated branch.',
    'cart.sync_badge': 'Synced with Google Sheets',

    // Branches
    'branches.title': 'Our Locations in El Salvador',
    'branches.subtitle': 'Strategic pickup and drop-off hubs across the country.',
    'branches.filter_label': 'Select a branch to center the interactive map:',
    'branches.hours': 'Opening hours',
    'branches.phone': 'Direct phone',
    'branches.btn.select': 'Pick up at this branch',

    // Auth Modal
    'auth.title': 'Customer Identification',
    'auth.desc': 'Sign in to manage your rentals, history, and expedite future bookings.',
    'auth.name': 'Full name',
    'auth.email': 'Email address',
    'auth.phone': 'Phone / WhatsApp',
    'auth.btn.save': 'Save & Continue',
    'auth.btn.cancel': 'Cancel',

    // Admin
    'admin.login_title': 'Admin Login',
    'admin.login_desc': 'Demo credentials: admin / admin123',
    'admin.user': 'Username',
    'admin.pass': 'Password',
    'admin.login_btn': 'Access Dashboard',
    'admin.logout_btn': 'Log Out Admin',
    'admin.tab.inventory': 'Inventory & Stock',
    'admin.tab.trips': 'Trips & Reservations',
    'admin.tab.clients': 'Clients',
    'admin.tab.branches': 'Branches',
    'admin.tab.sheets': 'Google Sheets API',
    'admin.tab.audit': 'Technical Audit',

    // Admin - Inventory
    'admin.inv.add_btn': '+ New Vehicle',
    'admin.inv.model': 'Model & Brand',
    'admin.inv.type': 'Type',
    'admin.inv.price': 'Price/Day',
    'admin.inv.stock': 'Current Stock',
    'admin.inv.status': 'Status',
    'admin.inv.actions': 'Actions',
    'admin.inv.active': 'Active',
    'admin.inv.paused': 'Paused',
    'admin.inv.pause_btn': 'Pause',
    'admin.inv.resume_btn': 'Activate',
    'admin.inv.delete_btn': 'Delete',

    // Admin - Trips
    'admin.trips.id': 'Code',
    'admin.trips.client': 'Client',
    'admin.trips.vehicle': 'Vehicle',
    'admin.trips.dates': 'Dates',
    'admin.trips.branch': 'Branch',
    'admin.trips.total': 'Total USD',
    'admin.trips.status': 'Status',
    'admin.trips.btn_finish': 'Complete Trip (Release Stock)',
    'admin.trips.btn_cancel': 'Cancel Trip (Restore Stock)',
    'admin.trips.status_en_curso': 'In progress',
    'admin.trips.status_finalizado': 'Completed',
    'admin.trips.status_cancelado': 'Cancelled',

    // General
    'common.currency': 'USD $',
    'common.passengers': 'passengers',
    'common.loading': 'Loading...',
    'common.close': 'Close'
  }
};

export function t(key: string, lang: Language): string {
  const dict = DICTIONARY[lang] || DICTIONARY.es;
  return dict[key] || key;
}

export function translateValue(val: string, lang: Language): string {
  if (lang === 'es') return val;
  const map: Record<string, string> = {
    'Camioneta': 'Truck',
    'Sedán': 'Sedan',
    'SUV': 'SUV',
    'Motocicleta': 'Motorcycle',
    'Compacto': 'Compact',
    'Automático': 'Automatic',
    'Manual': 'Manual',
    'Gasolina': 'Gasoline',
    'Eléctrico': 'Electric',
    'Híbrido': 'Hybrid',
    'en_curso': 'In Progress',
    'finalizado': 'Completed',
    'cancelado': 'Cancelled'
  };
  return map[val] || val;
}
