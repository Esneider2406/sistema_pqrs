/* =============================================
   AURA DESK — Main JavaScript
   SPA Router + CRUD + Charts + Chat IA Mock
   ============================================= */

   'use strict';

   /* =============================================
      GLOBAL STATE
      ============================================= */
   const AppState = {
     currentView: 'dashboard',
     pqrs: [],          // Main data array
     nextId: 100,       // Auto-increment ID
     currentTicketId: null,
     chatMessages: {},  // ticketId → messages[]
     filters: { estado: 'todos', tipo: 'todos', prioridad: 'todos' },
     searchQuery: '',
     currentPage: 1,
     itemsPerPage: 8,
   };
   
   /* =============================================
      MOCK DATA
      ============================================= */
   const TIPOS = ['Petición', 'Queja', 'Reclamo', 'Sugerencia'];
   const ESTADOS = ['Abierto', 'En Proceso', 'Resuelto', 'Cerrado', 'Pendiente'];
   const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica'];
   const AGENTES = ['Carlos Mendoza', 'Elena Rojas', 'David Muñoz', 'Laura Torres', 'Aura AI'];
   const CATEGORIAS = ['Facturación', 'Soporte Técnico', 'Comercial', 'Logística', 'General'];
   
   function generateMockPQRS() {
     const items = [
       { asunto: 'Falla en servicio de facturación', tipo: 'Reclamo', estado: 'En Proceso', prioridad: 'Crítica', solicitante: 'Empresa Andina S.A.', email: 'ea@empresa.com', categoria: 'Facturación', descripcion: 'El sistema de facturación presenta errores al generar documentos PDF.' },
       { asunto: 'Demora en entrega de producto', tipo: 'Queja', estado: 'Abierto', prioridad: 'Alta', solicitante: 'María Gómez', email: 'maria@gmail.com', categoria: 'Logística', descripcion: 'Mi pedido lleva 10 días sin llegar y el rastreo no muestra información.' },
       { asunto: 'Actualización de datos de cuenta', tipo: 'Petición', estado: 'Resuelto', prioridad: 'Media', solicitante: 'Juan Pérez', email: 'juan@correo.com', categoria: 'Comercial', descripcion: 'Solicito actualizar mi correo electrónico y teléfono de contacto.' },
       { asunto: 'Error en facturación de servicio premium mensual', tipo: 'Reclamo', estado: 'En Proceso', prioridad: 'Alta', solicitante: 'Laura Martínez', email: 'laura@empresa.com', categoria: 'Facturación', descripcion: 'Me cobraron doble el mes pasado. Adjunto factura y captura del banco.' },
       { asunto: 'Solicitud de cambio de plan corporativo', tipo: 'Petición', estado: 'Resuelto', prioridad: 'Media', solicitante: 'Carlos Gómez', email: 'carlos@tech.io', categoria: 'Comercial', descripcion: 'Deseo migrar del plan básico al plan empresarial para 50 usuarios.' },
       { asunto: 'Problemas de acceso a la plataforma', tipo: 'Queja', estado: 'Abierto', prioridad: 'Alta', solicitante: 'Ana Rodríguez', email: 'ana@mail.com', categoria: 'Soporte Técnico', descripcion: 'Desde ayer no puedo ingresar al sistema. El mensaje dice "usuario inactivo".' },
       { asunto: 'Propuesta de mejora en reportes', tipo: 'Sugerencia', estado: 'Pendiente', prioridad: 'Baja', solicitante: 'Pedro Lima', email: 'pedro@empresa.co', categoria: 'General', descripcion: 'Sería útil poder exportar los reportes en formato Excel directamente.' },
       { asunto: 'Cargo no reconocido en extracto', tipo: 'Reclamo', estado: 'Abierto', prioridad: 'Alta', solicitante: 'Sofía Castro', email: 'sofia@mail.com', categoria: 'Facturación', descripcion: 'Aparece un cargo de $89.000 que no reconozco en mi extracto de este mes.' },
       { asunto: 'Solicitud de capacitación al equipo', tipo: 'Petición', estado: 'Cerrado', prioridad: 'Baja', solicitante: 'TechCorp S.A.S.', email: 'admin@techcorp.com', categoria: 'Comercial', descripcion: 'Necesitamos una sesión de capacitación para nuestros 15 nuevos usuarios.' },
       { asunto: 'Sugerencia diseño de interfaz móvil', tipo: 'Sugerencia', estado: 'Pendiente', prioridad: 'Baja', solicitante: 'Diego Morales', email: 'diego@startup.io', categoria: 'General', descripcion: 'La app móvil podría mejorar navegación y accesibilidad de botones.' },
       { asunto: 'Fallo al enviar correos automáticos', tipo: 'Queja', estado: 'En Proceso', prioridad: 'Crítica', solicitante: 'Distribuidora Norte', email: 'info@distnorte.com', categoria: 'Soporte Técnico', descripcion: 'Los correos de confirmación de orden no están llegando a los clientes.' },
       { asunto: 'Reembolso por doble pago', tipo: 'Reclamo', estado: 'Resuelto', prioridad: 'Media', solicitante: 'Elena Vargas', email: 'elena@hotmail.com', categoria: 'Facturación', descripcion: 'Realicé el pago dos veces por error, solicito reembolso del segundo cargo.' },
     ];
   
     const now = Date.now();
     return items.map((item, i) => ({
       id: `TK-2024-${String(AppState.nextId + i).padStart(3, '0')}`,
       ...item,
       agente: AGENTES[i % AGENTES.length],
       fechaCreacion: new Date(now - (i * 3600000 * (i + 2))).toISOString(),
       fechaActualizacion: new Date(now - (i * 1800000)).toISOString(),
       sla: Math.floor(Math.random() * 90) + 10,
       canal: ['Email', 'Web', 'Chat', 'Teléfono'][i % 4],
     }));
   }
   
   function initData() {
     AppState.pqrs = generateMockPQRS();
     AppState.nextId += AppState.pqrs.length;
   
     // Initial chat for first ticket
     const tid = AppState.pqrs[3].id;
     AppState.currentTicketId = tid;
     AppState.chatMessages[tid] = [
       {
         role: 'user', name: 'Laura Martínez', avatar: 'LM',
         text: 'Hola equipo, he revisado mi estado de cuenta de este mes y veo que se me ha cobrado doble el cargo de la suscripción premium (aparecen dos cargos de $49.99 el día 15). Adjunto la factura y captura del banco. Necesito que me reversen ese cobro extra lo antes posible.',
         time: 'Hoy, 08:30 AM', isAnalysis: false,
       },
       {
         role: 'ai-analysis', name: 'Aura IA', avatar: 'AI',
         analysis: { intención: 'Reembolso / Cobro Doble', urgencia: 'Alta (Cliente Premium)', sentimiento: 'Frustrado' },
         text: 'Se ha detectado una anomalía general en el lote de pagos del día 15. Aplica política de reembolso automático #PR-04.',
         time: 'Hoy, 08:31 AM',
       },
       {
         role: 'agent', name: 'Carlos Mendoza', avatar: 'CM',
         text: 'Estimada Laura, hemos recibido su reporte y verificamos la anomalía. Procederemos con el reembolso en las próximas 24-48 horas hábiles.',
         time: 'Hoy, 09:15 AM', isAnalysis: false,
       }
     ];
   }
   
   /* =============================================
      ROUTER / VIEW ENGINE
      ============================================= */
   function navigateTo(view) {
     AppState.currentView = view;
     AppState.currentPage = 1;
   
     // Update nav
     document.querySelectorAll('.nav-item').forEach(el => {
       el.classList.toggle('active', el.dataset.view === view);
     });
   
     // Render view
     const content = document.getElementById('content-area');
     content.className = 'content-area fade-in';
     content.innerHTML = '';
   
     const renders = {
       dashboard: renderDashboard,
       metrics: renderMetrics,
       management: renderManagement,
       create: renderCreate,
       ticket: renderTicketDetail,
       teams: renderTeams,
       settings: renderSettings,
     };
   
     if (renders[view]) renders[view](content);
     else content.innerHTML = `<div class="empty-state"><div class="empty-icon">🔧</div><div class="empty-title">Vista en construcción</div></div>`;
   
     updateNavCounts();
     // Close sidebar on mobile
     if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
   }
   
   /* =============================================
      NAV HELPERS
      ============================================= */
   function updateNavCounts() {
     const count = document.getElementById('nav-count-management');
     if (count) count.textContent = AppState.pqrs.filter(p => p.estado === 'Abierto' || p.estado === 'En Proceso').length;
   }
   
   /* =============================================
      VIEW: DASHBOARD
      ============================================= */
   function renderDashboard(container) {
     const stats = getStats();
     const recent = AppState.pqrs.slice(0, 5);
     const high = AppState.pqrs.filter(p => p.prioridad === 'Crítica' || p.prioridad === 'Alta').slice(0, 4);
   
     container.innerHTML = `
       <div class="page-header">
         <div class="flex-row">
           <div>
             <h1 class="page-title">Resumen Hoy</h1>
             <p class="page-subtitle">Vista general del estado de solicitudes PQRS y rendimiento.</p>
           </div>
           <div style="margin-left:auto;display:flex;gap:8px">
             ${['Hoy','7D','30D'].map((t,i) => `<button class="filter-btn ${i===0?'active':''}" onclick="filterDashboard(this,'${t}')">${t}</button>`).join('')}
             <button class="filter-btn">⚙</button>
           </div>
         </div>
       </div>
   
       <!-- Metric Cards -->
       <div class="metrics-grid" id="metrics-grid">
         ${metricCard('Abiertas Activas', stats.activas, '📂', 'blue', `↑${stats.deltaActivas}% vs ayer`, 'up')}
         ${metricCard('Dentro del SLA', stats.sla + '%', '✅', 'green', `↑${stats.deltaSLA}% vs semana pasada`, 'up')}
         ${metricCard('Vencidas', stats.vencidas, '⚠️', 'red', `↑${stats.deltaVencidas} requieren atención`, 'down')}
         ${metricCard('Resueltas hoy', stats.resueltas, '✨', 'purple', `↑${stats.deltaResueltas}% deflexión total`, 'up')}
       </div>
   
       <div class="two-col">
         <!-- Priority Inbox + Chart -->
         <div style="display:flex;flex-direction:column;gap:16px">
           <!-- High Priority Inbox -->
           <div class="card">
             <div class="card-header">
               <div>
                 <div class="card-title">Bandeja Prioridad Alta</div>
               </div>
               <div class="flex-row">
                 <span class="badge badge-red">${high.length} urgentes</span>
                 <a class="card-link" onclick="navigateTo('management')">Ver todas →</a>
               </div>
             </div>
             <div class="card-body">
               <table class="data-table" style="font-size:.8rem">
                 <thead><tr><th>ID TICKET</th><th>ASUNTO / SOLICITANTE</th><th>TIPO & ESTADO</th><th>ASIGNADO</th></tr></thead>
                 <tbody>
                   ${high.map(p => `
                     <tr onclick="openTicketDetail('${p.id}')">
                       <td><span class="ticket-id">#${p.id}</span><br><span class="text-muted">${timeAgo(p.fechaCreacion)}</span></td>
                       <td><div style="font-weight:600;font-size:.82rem">${p.asunto}</div><div class="text-muted" style="margin-top:2px">${p.solicitante}</div></td>
                       <td>
                         <span class="badge ${tipoBadge(p.tipo)}">${p.tipo}</span><br>
                         <span style="display:flex;align-items:center;gap:4px;margin-top:4px"><span class="priority-dot ${prioDot(p.prioridad)}"></span><span class="text-muted">${p.prioridad}</span></span>
                       </td>
                       <td><span class="badge badge-gray">${p.agente.split(' ')[0]}</span></td>
                     </tr>
                   `).join('')}
                 </tbody>
               </table>
             </div>
           </div>
   
           <!-- Chart -->
           <div class="card">
             <div class="card-header">
               <div>
                 <div class="card-title">Tendencias de Solicitudes</div>
                 <div class="card-subtitle">Volumen de ingresos vs resoluciones (Últimos 7 días)</div>
               </div>
               <div class="chart-legend">
                 <span><span class="legend-dot" style="background:var(--blue)"></span>Ingresadas</span>
                 <span><span class="legend-dot" style="background:var(--green)"></span>Resueltas</span>
               </div>
             </div>
             <div class="card-body">
               ${renderLineChart([100,82,94,78,88,60,40],[65,50,70,55,75,42,25])}
             </div>
           </div>
         </div>
   
         <!-- Right Column -->
         <div style="display:flex;flex-direction:column;gap:16px">
           <!-- Triage Rápido -->
           <div class="card">
             <div class="card-header"><div class="card-title">Triage Rápido</div></div>
             <div class="card-body">
               <div class="triage-grid">
                 ${['Petición','Queja','Reclamo','Sugerencia'].map(t => `
                   <button class="triage-btn" onclick="quickCreate('${t}')">
                     <span style="font-size:1.3rem">${tipoEmoji(t)}</span>
                     ${t}
                   </button>
                 `).join('')}
               </div>
             </div>
           </div>
   
           <!-- Insights IA -->
           <div class="card">
             <div class="card-header">
               <div class="card-title flex-row">
                 <div class="ai-icon">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke-width="1.5"/></svg>
                 </div>
                 Insights IA
               </div>
             </div>
             <div class="card-body">
               <div class="insight-card">
                 <div class="insight-title">📈 Pico de Quejas Detectado</div>
                 <div class="insight-text">Incremento del 40% en quejas sobre "Demora de envíos" en la zona norte durante las últimas 4 horas.</div>
                 <span class="insight-link" onclick="navigateTo('metrics')">Ver análisis detallado →</span>
               </div>
               <div class="insight-card">
                 <div class="insight-title">✅ Resolución Automática</div>
                 <div class="insight-text">Aura IA ha resuelto con éxito ${Math.floor(Math.random()*8)+8} peticiones de "Cambio de contraseña" sin intervención humana hoy.</div>
               </div>
             </div>
           </div>
   
           <!-- Activity -->
           <div class="card">
             <div class="card-header"><div class="card-title">Actividad Reciente</div></div>
             <div class="card-body">
               <div class="activity-list" id="activity-list">
                 ${recent.map(p => `
                   <div class="activity-item">
                     <div class="activity-dot" style="background:${estadoColor(p.estado)}"></div>
                     <div class="activity-content">
                       <div class="activity-text"><strong>#${p.id}</strong> — ${p.asunto.substring(0,40)}${p.asunto.length>40?'…':''}</div>
                       <div class="activity-time">${p.estado} · ${timeAgo(p.fechaActualizacion)}</div>
                     </div>
                   </div>
                 `).join('')}
               </div>
             </div>
           </div>
         </div>
       </div>
     `;
   }
   
   function metricCard(label, value, icon, color, delta, direction) {
     return `
       <div class="metric-card">
         <div class="metric-header">
           <div class="metric-label">${label}</div>
           <div class="metric-icon" style="background:var(--${color}-light);color:var(--${color})">${icon}</div>
         </div>
         <div class="metric-value">${value}</div>
         <div class="metric-delta ${direction}">${delta}</div>
       </div>
     `;
   }
   
   function getStats() {
     const activas = AppState.pqrs.filter(p => p.estado === 'Abierto' || p.estado === 'En Proceso').length;
     const resueltas = AppState.pqrs.filter(p => p.estado === 'Resuelto' || p.estado === 'Cerrado').length;
     const vencidas = AppState.pqrs.filter(p => p.sla > 85).length;
     return {
       activas,
       resueltas,
       vencidas,
       sla: Math.round((AppState.pqrs.filter(p => p.sla <= 85).length / Math.max(1, AppState.pqrs.length)) * 100),
       deltaActivas: 12,
       deltaSLA: 2.1,
       deltaVencidas: 3,
       deltaResueltas: 18,
     };
   }
   
   function filterDashboard(btn, period) {
     btn.closest('.flex-row').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     showToast('info', `Datos filtrados: ${period}`, 'Actualizando vista del dashboard…');
   }
   
   /* =============================================
      VIEW: METRICS
      ============================================= */
   function renderMetrics(container) {
     const byTipo = TIPOS.map(t => ({ label: t, count: AppState.pqrs.filter(p => p.tipo === t).length }));
     const byEstado = ESTADOS.map(e => ({ label: e, count: AppState.pqrs.filter(p => p.estado === e).length }));
     const total = AppState.pqrs.length || 1;
   
     container.innerHTML = `
       <div class="page-header">
         <div class="flex-row">
           <div>
             <h1 class="page-title">Panel Analítico</h1>
             <p class="page-subtitle">Métricas de rendimiento y tiempos de respuesta.</p>
           </div>
           <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
             <select class="filter-select" onchange="updateMetricsPeriod(this)">
               <option>Últimos 7 días</option><option>Últimos 30 días</option><option>Este mes</option><option>Este año</option>
             </select>
             <select class="filter-select"><option>Todos los Equipos</option><option>Soporte Nivel 1</option><option>Soporte Nivel 2</option><option>Facturación</option></select>
             <button class="btn-primary" onclick="exportMetrics()">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
               Exportar
             </button>
           </div>
         </div>
       </div>
   
       <!-- KPI Row -->
       <div class="metrics-grid" style="margin-bottom:20px">
         ${metricCard('T. Primera Respuesta', '12m', '🚀', 'blue', '↓3m vs período anterior', 'up')}
         ${metricCard('T. Resolución Promedio', '4.2h', '⏱️', 'teal', '↓1.5h vs período anterior', 'up')}
         ${metricCard('Cumplimiento SLA', '96.8%', '🎯', 'green', '↑1.2% vs período anterior', 'up')}
         ${metricCard('Satisfacción (CSAT)', '4.8/5.0', '⭐', 'amber', '↑0.2 vs período anterior', 'up')}
       </div>
   
       <div class="two-col" style="margin-bottom:20px">
         <!-- Canal Chart -->
         <div class="card">
           <div class="card-header">
             <div>
               <div class="card-title">Volumen por Canal</div>
               <div class="card-subtitle">Distribución de tickets entrantes</div>
             </div>
             <div class="chart-legend">
               <span><span class="legend-dot" style="background:var(--blue)"></span>Email</span>
               <span><span class="legend-dot" style="background:var(--purple)"></span>Web</span>
               <span><span class="legend-dot" style="background:var(--green)"></span>Chat</span>
             </div>
           </div>
           <div class="card-body">${renderMultiLineChart()}</div>
         </div>
   
         <!-- IA vs Manual -->
         <div class="card">
           <div class="card-header">
             <div>
               <div class="card-title">Resolución IA vs Manual</div>
               <div class="card-subtitle">Tickets resueltos por tipo de agente</div>
             </div>
             <div class="chart-legend">
               <span><span class="legend-dot" style="background:var(--border)"></span>Manual</span>
               <span><span class="legend-dot" style="background:var(--blue)"></span>Resuelto IA</span>
             </div>
           </div>
           <div class="card-body">${renderBarChart()}</div>
         </div>
       </div>
   
       <div class="three-col" style="margin-bottom:20px">
         <!-- Tipo Distribution -->
         <div class="card">
           <div class="card-header"><div class="card-title">Por Tipo</div></div>
           <div class="card-body">
             <div class="donut-wrap">
               ${renderDonutChart(byTipo, total)}
               <div class="donut-legend">
                 ${byTipo.map((t, i) => `
                   <div class="donut-legend-item">
                     <div class="donut-legend-dot" style="background:${donutColors[i]}"></div>
                     <div>${t.label}: <strong>${t.count}</strong></div>
                   </div>
                 `).join('')}
               </div>
             </div>
           </div>
         </div>
   
         <!-- Estado Distribution -->
         <div class="card">
           <div class="card-header"><div class="card-title">Por Estado</div></div>
           <div class="card-body">
             <div style="display:flex;flex-direction:column;gap:10px">
               ${byEstado.map(e => `
                 <div>
                   <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:4px">
                     <span>${e.label}</span><strong>${e.count}</strong>
                   </div>
                   <div style="height:6px;background:var(--border);border-radius:3px">
                     <div style="height:100%;width:${Math.round(e.count/total*100)}%;background:${estadoColor(e.label)};border-radius:3px;transition:width .8s ease"></div>
                   </div>
                 </div>
               `).join('')}
             </div>
           </div>
         </div>
   
         <!-- Top Agents -->
         <div class="card">
           <div class="card-header"><div class="card-title">Top Agentes</div></div>
           <div class="card-body">
             ${AGENTES.map((a, i) => {
               const resolved = AppState.pqrs.filter(p => p.agente === a && (p.estado === 'Resuelto' || p.estado === 'Cerrado')).length;
               return `
                 <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                   <div class="user-avatar" style="width:30px;height:30px;font-size:.68rem">${a.split(' ').map(w=>w[0]).join('')}</div>
                   <div style="flex:1">
                     <div style="font-size:.82rem;font-weight:600">${a}</div>
                     <div class="match-bar">
                       <div style="height:4px;background:var(--border);border-radius:2px;margin-top:3px">
                         <div style="height:100%;width:${Math.min(100, (resolved+2)*15)}%;background:var(--blue);border-radius:2px"></div>
                       </div>
                     </div>
                   </div>
                   <span class="badge badge-blue">${resolved} ✓</span>
                 </div>
               `;
             }).join('')}
           </div>
         </div>
       </div>
   
       <!-- Alerts -->
       <div class="card">
         <div class="card-header"><div class="card-title">🔔 Alertas y Monitoreo en Tiempo Real</div></div>
         <div class="card-body">
           <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
             <div style="background:var(--amber-light);border:1px solid var(--amber);border-radius:var(--radius);padding:14px">
               <div style="font-weight:700;color:#b45309;margin-bottom:6px">📈 Pico de Demanda Detectado <span class="badge badge-amber">Atención</span></div>
               <div style="font-size:.8rem;color:#92400e">Incremento inusual del 35% en tickets de categoría "Facturación" en los últimos 30 minutos.</div>
               <a class="insight-link" onclick="navigateTo('management')">Ver tickets relacionados →</a>
             </div>
             <div style="background:var(--red-light);border:1px solid var(--red);border-radius:var(--radius);padding:14px">
               <div style="font-weight:700;color:#991b1b;margin-bottom:6px">⏱ SLA en Riesgo <span class="badge badge-red">Crítico</span></div>
               <div style="font-size:.8rem;color:#7f1d1d">12 tickets del equipo "Soporte Nivel 2" están a menos de 1 hora de incumplir el SLA de resolución.</div>
               <a class="insight-link" onclick="navigateTo('management')">Ver tickets en riesgo →</a>
             </div>
           </div>
         </div>
       </div>
     `;
   }
   
   function updateMetricsPeriod(sel) {
     showToast('info', `Período: ${sel.value}`, 'Recalculando métricas…');
   }
   function exportMetrics() {
     showToast('success', 'Exportación iniciada', 'El reporte se descargará en breve.');
   }
   
   /* =============================================
      VIEW: MANAGEMENT
      ============================================= */
   function renderManagement(container) {
     const filtered = getFilteredPQRS();
     const paginated = paginate(filtered);
     const totalPages = Math.ceil(filtered.length / AppState.itemsPerPage);
   
     container.innerHTML = `
       <div class="page-header">
         <div class="flex-row">
           <div>
             <h1 class="page-title">Gestión PQRS</h1>
             <p class="page-subtitle">Administra y resuelve solicitudes con asistencia de IA.</p>
           </div>
           <button class="btn-primary" style="margin-left:auto" onclick="navigateTo('create')">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
             Nueva PQRS
           </button>
         </div>
       </div>
   
       <!-- Toolbar -->
       <div class="mgmt-toolbar">
         <div class="mgmt-search">
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
           <input type="text" id="mgmt-search-input" placeholder="Buscar por ID, asunto o solicitante…" value="${AppState.searchQuery}" oninput="onSearchInput(this.value)" />
         </div>
         <div class="mgmt-filters">
           <select class="filter-select" id="filter-estado" onchange="setFilter('estado', this.value)">
             <option value="todos">Estado: Todos</option>
             ${ESTADOS.map(e => `<option value="${e}" ${AppState.filters.estado===e?'selected':''}>${e}</option>`).join('')}
           </select>
           <select class="filter-select" id="filter-tipo" onchange="setFilter('tipo', this.value)">
             <option value="todos">Tipo: Todos</option>
             ${TIPOS.map(t => `<option value="${t}" ${AppState.filters.tipo===t?'selected':''}>${t}</option>`).join('')}
           </select>
           <select class="filter-select" id="filter-prioridad" onchange="setFilter('prioridad', this.value)">
             <option value="todos">Prioridad: Todas</option>
             ${PRIORIDADES.map(p => `<option value="${p}" ${AppState.filters.prioridad===p?'selected':''}>${p}</option>`).join('')}
           </select>
           ${(AppState.filters.estado!=='todos'||AppState.filters.tipo!=='todos'||AppState.filters.prioridad!=='todos'||AppState.searchQuery) ?
             `<button class="filter-btn" onclick="clearFilters()">✕ Limpiar</button>` : ''}
         </div>
       </div>
   
       <!-- Table -->
       <div class="card">
         <div style="overflow-x:auto">
           ${filtered.length === 0 ? `
             <div class="empty-state">
               <div class="empty-icon">🔍</div>
               <div class="empty-title">No se encontraron PQRS</div>
               <div class="empty-text">Intenta cambiar los filtros o el término de búsqueda.</div>
             </div>
           ` : `
             <table class="data-table">
               <thead>
                 <tr>
                   <th><input type="checkbox" id="check-all" onchange="toggleAllCheck(this)" /></th>
                   <th>ID / ASUNTO</th>
                   <th>SOLICITANTE</th>
                   <th>TIPO</th>
                   <th>ESTADO</th>
                   <th>PRIORIDAD</th>
                   <th>AGENTE</th>
                   <th>FECHA</th>
                   <th>ACCIONES</th>
                 </tr>
               </thead>
               <tbody>
                 ${paginated.map(p => `
                   <tr onclick="openTicketDetail('${p.id}')">
                     <td onclick="event.stopPropagation()"><input type="checkbox" class="row-check" data-id="${p.id}" /></td>
                     <td>
                       <div style="font-family:var(--mono);font-size:.72rem;color:var(--blue);font-weight:500">#${p.id}</div>
                       <div style="font-weight:600;font-size:.82rem;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.asunto}</div>
                     </td>
                     <td>
                       <div style="font-size:.82rem;font-weight:500">${p.solicitante}</div>
                       <div class="text-muted">${p.canal}</div>
                     </td>
                     <td><span class="badge ${tipoBadge(p.tipo)}">${p.tipo}</span></td>
                     <td><span class="badge ${estadoBadge(p.estado)}">${p.estado}</span></td>
                     <td>
                       <div class="flex-row">
                         <span class="priority-dot ${prioDot(p.prioridad)}"></span>
                         <span style="font-size:.82rem">${p.prioridad}</span>
                       </div>
                     </td>
                     <td>
                       <div style="font-size:.82rem">${p.agente.split(' ')[0]}</div>
                     </td>
                     <td class="text-muted" style="font-size:.78rem;white-space:nowrap">${formatDate(p.fechaCreacion)}</td>
                     <td onclick="event.stopPropagation()">
                       <div class="flex-row">
                         <button class="action-btn" onclick="openTicketDetail('${p.id}')" title="Ver detalle">👁</button>
                         <button class="action-btn success" onclick="changeEstado('${p.id}')" title="Cambiar estado">↕</button>
                         <button class="action-btn danger" onclick="deletePQRS('${p.id}')" title="Eliminar">✕</button>
                       </div>
                     </td>
                   </tr>
                 `).join('')}
               </tbody>
             </table>
           `}
         </div>
         <div style="padding:0 16px 16px;display:flex;align-items:center">
           <span class="page-info">Mostrando ${paginated.length} de ${filtered.length} tickets</span>
           ${totalPages > 1 ? `
             <div class="pagination">
               <button class="page-btn" onclick="goToPage(${AppState.currentPage-1})" ${AppState.currentPage===1?'disabled':''}>‹</button>
               ${Array.from({length:totalPages},(_,i)=>`<button class="page-btn ${i+1===AppState.currentPage?'active':''}" onclick="goToPage(${i+1})">${i+1}</button>`).join('')}
               <button class="page-btn" onclick="goToPage(${AppState.currentPage+1})" ${AppState.currentPage===totalPages?'disabled':''}>›</button>
             </div>
           ` : ''}
         </div>
       </div>
     `;
   }
   
   function getFilteredPQRS() {
     return AppState.pqrs.filter(p => {
       const q = AppState.searchQuery.toLowerCase();
       const matchSearch = !q || p.id.toLowerCase().includes(q) || p.asunto.toLowerCase().includes(q) || p.solicitante.toLowerCase().includes(q);
       const matchEstado = AppState.filters.estado === 'todos' || p.estado === AppState.filters.estado;
       const matchTipo = AppState.filters.tipo === 'todos' || p.tipo === AppState.filters.tipo;
       const matchPrio = AppState.filters.prioridad === 'todos' || p.prioridad === AppState.filters.prioridad;
       return matchSearch && matchEstado && matchTipo && matchPrio;
     });
   }
   
   function paginate(arr) {
     const start = (AppState.currentPage - 1) * AppState.itemsPerPage;
     return arr.slice(start, start + AppState.itemsPerPage);
   }
   
   function onSearchInput(val) {
     AppState.searchQuery = val;
     AppState.currentPage = 1;
     renderManagement(document.getElementById('content-area'));
   }
   
   function setFilter(key, val) {
     AppState.filters[key] = val;
     AppState.currentPage = 1;
     renderManagement(document.getElementById('content-area'));
   }
   
   function clearFilters() {
     AppState.filters = { estado: 'todos', tipo: 'todos', prioridad: 'todos' };
     AppState.searchQuery = '';
     AppState.currentPage = 1;
     renderManagement(document.getElementById('content-area'));
   }
   
   function goToPage(page) {
     const filtered = getFilteredPQRS();
     const totalPages = Math.ceil(filtered.length / AppState.itemsPerPage);
     if (page < 1 || page > totalPages) return;
     AppState.currentPage = page;
     renderManagement(document.getElementById('content-area'));
   }
   
   function toggleAllCheck(master) {
     document.querySelectorAll('.row-check').forEach(c => c.checked = master.checked);
   }
   
   function deletePQRS(id) {
     openModal(`
       <div class="modal-title">⚠️ Eliminar PQRS</div>
       <div class="modal-subtitle">Esta acción no se puede deshacer.</div>
       <p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:20px">¿Estás seguro de que deseas eliminar el ticket <strong>#${id}</strong>?</p>
       <div class="form-actions">
         <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
         <button class="btn-primary" style="background:var(--red);box-shadow:0 2px 8px rgba(239,68,68,.3)" onclick="confirmDelete('${id}')">Sí, eliminar</button>
       </div>
     `);
   }
   
   function confirmDelete(id) {
     AppState.pqrs = AppState.pqrs.filter(p => p.id !== id);
     closeModal();
     showToast('success', 'PQRS eliminada', `El ticket #${id} ha sido eliminado correctamente.`);
     renderManagement(document.getElementById('content-area'));
     updateNavCounts();
   }
   
   function changeEstado(id) {
     const pqrs = AppState.pqrs.find(p => p.id === id);
     if (!pqrs) return;
     openModal(`
       <div class="modal-title">Cambiar Estado</div>
       <div class="modal-subtitle">Ticket <strong>#${id}</strong> — ${pqrs.asunto}</div>
       <div class="form-group" style="margin-bottom:20px">
         <label class="form-label">Estado actual: <span class="badge ${estadoBadge(pqrs.estado)}">${pqrs.estado}</span></label>
         <select class="form-control" id="new-estado-select" style="margin-top:8px">
           ${ESTADOS.map(e => `<option value="${e}" ${e===pqrs.estado?'selected':''}>${e}</option>`).join('')}
         </select>
       </div>
       <div class="form-group" style="margin-bottom:20px">
         <label class="form-label">Nota (opcional)</label>
         <textarea class="form-control" id="estado-note" placeholder="Agregar comentario al cambio de estado…" rows="3"></textarea>
       </div>
       <div class="form-actions">
         <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
         <button class="btn-primary" onclick="confirmChangeEstado('${id}')">Guardar Cambio</button>
       </div>
     `);
   }
   
   function confirmChangeEstado(id) {
     const sel = document.getElementById('new-estado-select');
     const pqrs = AppState.pqrs.find(p => p.id === id);
     if (!pqrs || !sel) return;
     const prev = pqrs.estado;
     pqrs.estado = sel.value;
     pqrs.fechaActualizacion = new Date().toISOString();
     closeModal();
     showToast('success', 'Estado actualizado', `#${id}: ${prev} → ${pqrs.estado}`);
     if (AppState.currentView === 'management') renderManagement(document.getElementById('content-area'));
     updateNavCounts();
   }
   
   /* =============================================
      VIEW: CREATE PQRS
      ============================================= */
   function renderCreate(container) {
     container.innerHTML = `
       <div class="page-header">
         <h1 class="page-title">Crear PQRS</h1>
         <p class="page-subtitle">Completa el formulario para registrar una nueva solicitud.</p>
       </div>
       <div style="max-width:680px">
         <div class="card">
           <div class="card-body" style="padding-top:20px">
             <form id="create-form" onsubmit="submitPQRS(event)" novalidate>
               <div class="form-grid">
                 <div class="form-group">
                   <label class="form-label">Tipo de PQRS <span>*</span></label>
                   <select class="form-control" id="f-tipo" required>
                     <option value="">Selecciona un tipo…</option>
                     ${TIPOS.map(t => `<option value="${t}">${tipoEmoji(t)} ${t}</option>`).join('')}
                   </select>
                   <div class="form-error" id="err-tipo">Selecciona un tipo de PQRS.</div>
                 </div>
                 <div class="form-group">
                   <label class="form-label">Prioridad <span>*</span></label>
                   <select class="form-control" id="f-prioridad" required>
                     <option value="">Selecciona prioridad…</option>
                     ${PRIORIDADES.map(p => `<option value="${p}">${p}</option>`).join('')}
                   </select>
                   <div class="form-error" id="err-prioridad">Selecciona una prioridad.</div>
                 </div>
                 <div class="form-group">
                   <label class="form-label">Nombre del Solicitante <span>*</span></label>
                   <input type="text" class="form-control" id="f-solicitante" placeholder="Ej: Juan García" required />
                   <div class="form-error" id="err-solicitante">Ingresa el nombre del solicitante.</div>
                 </div>
                 <div class="form-group">
                   <label class="form-label">Correo Electrónico <span>*</span></label>
                   <input type="email" class="form-control" id="f-email" placeholder="correo@ejemplo.com" required />
                   <div class="form-error" id="err-email">Ingresa un correo válido.</div>
                 </div>
                 <div class="form-group">
                   <label class="form-label">Categoría</label>
                   <select class="form-control" id="f-categoria">
                     <option value="">Sin categoría</option>
                     ${CATEGORIAS.map(c => `<option value="${c}">${c}</option>`).join('')}
                   </select>
                 </div>
                 <div class="form-group">
                   <label class="form-label">Canal de Entrada</label>
                   <select class="form-control" id="f-canal">
                     ${['Email','Web','Chat','Teléfono'].map(c => `<option>${c}</option>`).join('')}
                   </select>
                 </div>
                 <div class="form-group full">
                   <label class="form-label">Asunto <span>*</span></label>
                   <input type="text" class="form-control" id="f-asunto" placeholder="Describe brevemente el motivo de la solicitud…" required />
                   <div class="form-error" id="err-asunto">El asunto es obligatorio.</div>
                 </div>
                 <div class="form-group full">
                   <label class="form-label">Descripción Detallada <span>*</span></label>
                   <textarea class="form-control" id="f-descripcion" rows="5" placeholder="Describe con detalle la situación, incluyendo fechas, referencias o documentos relevantes…" required></textarea>
                   <div class="form-error" id="err-descripcion">La descripción es obligatoria.</div>
                 </div>
                 <div class="form-group">
                   <label class="form-label">Asignar a Agente</label>
                   <select class="form-control" id="f-agente">
                     <option value="">Auto-asignar</option>
                     ${AGENTES.map(a => `<option value="${a}">${a}</option>`).join('')}
                   </select>
                 </div>
                 <div class="form-group">
                   <label class="form-label">Estado Inicial</label>
                   <select class="form-control" id="f-estado">
                     ${['Abierto','En Proceso'].map(e => `<option>${e}</option>`).join('')}
                   </select>
                 </div>
               </div>
               <hr class="divider" />
               <div class="form-actions">
                 <button type="button" class="btn-secondary" onclick="resetForm()">Limpiar</button>
                 <button type="submit" class="btn-primary btn-submit">
                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                   Crear PQRS
                 </button>
               </div>
             </form>
           </div>
         </div>
       </div>
     `;
   }
   
   function submitPQRS(e) {
     e.preventDefault();
     const fields = {
       tipo: { val: document.getElementById('f-tipo').value, err: 'err-tipo' },
       prioridad: { val: document.getElementById('f-prioridad').value, err: 'err-prioridad' },
       solicitante: { val: document.getElementById('f-solicitante').value.trim(), err: 'err-solicitante' },
       email: { val: document.getElementById('f-email').value.trim(), err: 'err-email' },
       asunto: { val: document.getElementById('f-asunto').value.trim(), err: 'err-asunto' },
       descripcion: { val: document.getElementById('f-descripcion').value.trim(), err: 'err-descripcion' },
     };
   
     let valid = true;
     Object.entries(fields).forEach(([key, f]) => {
       const errEl = document.getElementById(f.err);
       const inputEl = document.getElementById(`f-${key}`);
       if (!f.val || (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.val))) {
         errEl.classList.add('visible');
         inputEl.classList.add('error');
         valid = false;
       } else {
         errEl.classList.remove('visible');
         inputEl.classList.remove('error');
       }
     });
   
     if (!valid) { showToast('error', 'Formulario incompleto', 'Corrige los campos marcados en rojo.'); return; }
   
     const newPQRS = {
       id: `TK-2024-${String(AppState.nextId++).padStart(3, '0')}`,
       tipo: fields.tipo.val,
       prioridad: fields.prioridad.val,
       solicitante: fields.solicitante.val,
       email: fields.email.val,
       asunto: fields.asunto.val,
       descripcion: fields.descripcion.val,
       categoria: document.getElementById('f-categoria').value || 'General',
       canal: document.getElementById('f-canal').value,
       agente: document.getElementById('f-agente').value || AGENTES[Math.floor(Math.random() * AGENTES.length)],
       estado: document.getElementById('f-estado').value,
       sla: 0,
       fechaCreacion: new Date().toISOString(),
       fechaActualizacion: new Date().toISOString(),
     };
   
     AppState.pqrs.unshift(newPQRS);
     showToast('success', '¡PQRS creada exitosamente!', `#${newPQRS.id} ha sido registrada y asignada a ${newPQRS.agente}.`);
     updateNavCounts();
     navigateTo('management');
   }
   
   function resetForm() {
     document.getElementById('create-form').reset();
     document.querySelectorAll('.form-error').forEach(e => e.classList.remove('visible'));
     document.querySelectorAll('.form-control.error').forEach(e => e.classList.remove('error'));
   }
   
   function quickCreate(tipo) {
     navigateTo('create');
     setTimeout(() => {
       const sel = document.getElementById('f-tipo');
       if (sel) { sel.value = tipo; showToast('info', `Tipo preseleccionado: ${tipo}`, 'Completa el resto del formulario.'); }
     }, 100);
   }
   
   /* =============================================
      VIEW: TICKET DETAIL + IA CHAT
      ============================================= */
   function openTicketDetail(id) {
     const pqrs = AppState.pqrs.find(p => p.id === id);
     if (!pqrs) return;
     AppState.currentTicketId = id;
     if (!AppState.chatMessages[id]) AppState.chatMessages[id] = [];
     navigateTo('ticket');
   }
   
   function renderTicketDetail(container) {
     const id = AppState.currentTicketId;
     const pqrs = id ? AppState.pqrs.find(p => p.id === id) : AppState.pqrs[0];
     if (!pqrs) { navigateTo('management'); return; }
     AppState.currentTicketId = pqrs.id;
     if (!AppState.chatMessages[pqrs.id]) AppState.chatMessages[pqrs.id] = [];
   
     container.innerHTML = `
       <div class="page-header" style="margin-bottom:16px">
         <div class="flex-row">
           <button class="action-btn" onclick="navigateTo('management')">← Volver</button>
           <div>
             <h1 class="page-title" style="font-size:1.15rem">
               <span style="font-family:var(--mono);font-size:.85rem;color:var(--blue)">ID: #${pqrs.id}</span>
               <span class="badge badge-red" style="margin-left:8px">ALTA PRIORIDAD</span>
             </h1>
             <p class="page-subtitle" style="font-size:.9rem;font-weight:600;color:var(--text-primary);margin-top:2px">${pqrs.asunto}</p>
           </div>
           <div style="margin-left:auto;display:flex;gap:8px">
             <button class="action-btn success" onclick="changeEstado('${pqrs.id}')">Cambiar Estado</button>
             <button class="action-btn" onclick="deletePQRS('${pqrs.id}')">Eliminar</button>
           </div>
         </div>
       </div>
   
       <div class="ticket-detail-layout">
         <!-- LEFT: Ticket Info -->
         <div class="ticket-info-panel">
           <!-- Meta -->
           <div class="ticket-meta">
             <div class="ticket-meta-title">Información del Ticket</div>
             <div class="ticket-meta-row"><span class="meta-key">Estado</span><span class="badge ${estadoBadge(pqrs.estado)}">${pqrs.estado}</span></div>
             <div class="ticket-meta-row"><span class="meta-key">SLA Restante</span><span class="meta-val" style="color:${pqrs.sla>75?'var(--red)':'var(--text-primary)'}">2h 45m</span></div>
             <div class="ticket-meta-row"><span class="meta-key">Categoría</span><span class="meta-val">${pqrs.categoria}</span></div>
             <div class="ticket-meta-row"><span class="meta-key">Tiempo transcurrido</span></div>
             <div class="sla-bar" style="margin-top:-4px;margin-bottom:8px">
               <div class="sla-fill" style="width:${pqrs.sla}%;background:${pqrs.sla>75?'var(--red)':pqrs.sla>50?'var(--amber)':'var(--green)'}"></div>
             </div>
           </div>
   
           <!-- Solicitante -->
           <div class="ticket-meta">
             <div class="ticket-meta-title">Solicitante</div>
             <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
               <div class="user-avatar" style="width:40px;height:40px;font-size:.82rem">${pqrs.solicitante.split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
               <div>
                 <div style="font-weight:700">${pqrs.solicitante}</div>
                 <div class="text-muted">${pqrs.email}</div>
               </div>
             </div>
             <div class="ticket-meta-row"><span class="meta-key">Canal</span><span class="meta-val">${pqrs.canal}</span></div>
             <div class="ticket-meta-row"><span class="meta-key">Prioridad</span>
               <span class="flex-row"><span class="priority-dot ${prioDot(pqrs.prioridad)}"></span>${pqrs.prioridad}</span>
             </div>
             <div class="ticket-meta-row"><span class="meta-key">Agente</span><span class="meta-val">${pqrs.agente}</span></div>
             <button class="action-btn" style="width:100%;justify-content:center;margin-top:8px" onclick="showHistorial('${pqrs.id}')">Ver Historial (4)</button>
           </div>
   
           <!-- Attachments -->
           <div class="ticket-meta">
             <div class="ticket-meta-title" style="display:flex;justify-content:space-between">
               Adjuntos (2)
               <button class="action-btn" onclick="showToast('info','Adjuntar archivo','Funcionalidad de subida disponible.')">+ Añadir</button>
             </div>
             <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
               <div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg);border-radius:var(--radius-sm)">
                 <span style="font-size:1.1rem">📄</span>
                 <div style="flex:1"><div style="font-size:.78rem;font-weight:600">factura_agosto_error.pdf</div><div class="text-muted">1.2 MB</div></div>
               </div>
               <div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg);border-radius:var(--radius-sm)">
                 <span style="font-size:1.1rem">🖼</span>
                 <div style="flex:1"><div style="font-size:.78rem;font-weight:600">captura_pantalla_cobro.png</div><div class="text-muted">850 KB</div></div>
               </div>
             </div>
           </div>
         </div>
   
         <!-- CENTER: Chat -->
         <div class="ticket-chat-panel">
           <div class="chat-container">
             <div class="chat-header">
               <span class="chat-header-title">Conversación</span>
               <span class="badge badge-blue" id="ia-analyzing">
                 <span style="display:inline-block;width:7px;height:7px;border:1.5px solid var(--blue);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;margin-right:4px"></span>
                 IA Analizando
               </span>
             </div>
             <div class="chat-messages" id="chat-messages-${pqrs.id}">
               <div class="text-muted" style="text-align:center;font-size:.75rem;padding:8px 0">Ticket creado · Hoy, 08:30 AM</div>
               ${(AppState.chatMessages[pqrs.id] || []).map(renderMessage).join('')}
             </div>
             <div class="chat-input-area">
               <div class="chat-tabs">
                 <button class="chat-tab active" onclick="setTab(this,'interna')">Nota Interna</button>
                 <button class="chat-tab" onclick="setTab(this,'publica')">Respuesta Pública</button>
               </div>
               <div class="chat-input-row">
                 <input type="text" class="chat-input" id="chat-input-${pqrs.id}" placeholder="Escribe tu respuesta o usa '/' para comandos IA…" onkeydown="chatKeydown(event,'${pqrs.id}')" />
                 <button class="chat-send" onclick="sendMessage('${pqrs.id}')">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                 </button>
               </div>
             </div>
           </div>
         </div>
   
         <!-- RIGHT: IA Panel -->
         <div class="ticket-ai-panel">
           <!-- Asistente IA -->
           <div class="ai-panel-card">
             <div class="ai-panel-title">
               <div class="ai-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke-width="1.5"/></svg></div>
               Asistente Aura IA
             </div>
             <div class="mgmt-search" style="margin-bottom:12px">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
               <input type="text" placeholder="Buscar en base de conocimiento…" style="font-size:.78rem" onkeydown="searchKB(event)" />
             </div>
             <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px">Generadores IA</div>
             <div class="ai-gen-grid">
               ${[
                 {icon:'📝', label:'Respuesta Formal', fn:'genRespuesta'},
                 {icon:'🌐', label:'Traducir Ticket', fn:'genTraducir'},
                 {icon:'📋', label:'Resumir Caso', fn:'genResumen'},
                 {icon:'⚖️', label:'Verificar Política', fn:'genPolitica'},
               ].map(b => `<button class="ai-gen-btn" onclick="${b.fn}('${pqrs.id}')">${b.icon} ${b.label}</button>`).join('')}
             </div>
           </div>
   
           <!-- AI Summary -->
           <div class="ai-panel-card">
             <div class="ai-panel-title" style="font-size:.82rem">RESUMEN ACTIVO</div>
             <div class="ai-summary" id="ai-summary-${pqrs.id}">
               Cliente reporta ${pqrs.tipo.toLowerCase()} relacionado con "${pqrs.asunto.toLowerCase()}". IA analiza contexto. Se sugiere resolución estándar según política vigente.
             </div>
           </div>
   
           <!-- Reasignación Inteligente -->
           <div class="ai-panel-card">
             <div class="ai-panel-title">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               Reasignación Inteligente
             </div>
             <p class="text-muted" style="font-size:.75rem;margin-bottom:12px">La IA recomienda estos agentes basados en especialidad y carga actual:</p>
             ${[
               {name:'Elena Rojas', spec:'Especialista Facturación', match:94, color:'var(--green)', load:'Baja'},
               {name:'David Muñoz', spec:'Soporte Tier 2', match:78, color:'var(--amber)', load:'Media'},
             ].map(a => `
               <div class="assign-agent">
                 <div class="agent-avatar" style="background:var(--blue-light);color:var(--blue)">${a.name.split(' ').map(w=>w[0]).join('')}</div>
                 <div style="flex:1">
                   <div class="flex-row" style="justify-content:space-between"><span class="agent-name">${a.name}</span><span class="badge badge-green" style="font-size:.65rem">${a.match}% Match</span></div>
                   <div class="agent-spec">${a.spec} · Carga: ${a.load}</div>
                   <div class="sla-bar" style="margin-top:4px"><div class="sla-fill match-fill" style="width:${a.match}%;background:${a.color}"></div></div>
                 </div>
               </div>
             `).join('')}
             <button class="btn-primary" style="width:100%;margin-top:10px;justify-content:center" onclick="reassignTicket('${pqrs.id}')">
               Reasignar a Elena
             </button>
           </div>
         </div>
       </div>
     `;
   
     // Scroll chat to bottom
     setTimeout(() => {
       const chatEl = document.getElementById(`chat-messages-${pqrs.id}`);
       if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
       // Hide "analyzing" badge after 2s
       setTimeout(() => {
         const badge = document.getElementById('ia-analyzing');
         if (badge) { badge.innerHTML = '✅ IA Lista'; badge.style.background = 'var(--green-light)'; badge.style.color = '#16a34a'; }
       }, 2000);
     }, 100);
   }
   
   function renderMessage(msg) {
     if (msg.role === 'ai-analysis') {
       return `
         <div class="msg fade-in" style="max-width:95%">
           <div>
             <div class="msg-analysis">
               <strong>🤖 ANÁLISIS IA</strong>
               ${Object.entries(msg.analysis).map(([k,v]) => `<span class="analysis-tag">${k}: ${v}</span>`).join('')}
               <div style="margin-top:8px;color:var(--text-secondary)">${msg.text}</div>
             </div>
             <div class="msg-time">${msg.time}</div>
           </div>
         </div>
       `;
     }
     const isUser = msg.role === 'user';
     const isAgent = msg.role === 'agent';
     return `
       <div class="msg ${isUser ? 'user' : ''} fade-in">
         <div class="msg-avatar ${isUser ? 'human' : 'ai'}" style="${isAgent?'background:var(--purple-light);color:var(--purple)':''}">${msg.avatar}</div>
         <div>
           <div style="font-size:.72rem;font-weight:600;color:var(--text-muted);margin-bottom:3px${isUser?';text-align:right':''}">${msg.name}</div>
           <div class="msg-bubble">${msg.text}</div>
           <div class="msg-time">${msg.time}</div>
         </div>
       </div>
     `;
   }
   
   function sendMessage(ticketId) {
     const input = document.getElementById(`chat-input-${ticketId}`);
     if (!input || !input.value.trim()) return;
     const text = input.value.trim();
     input.value = '';
   
     const msg = {
       role: 'agent', name: 'Carlos Mendoza', avatar: 'CM',
       text, time: formatTime(new Date()), isAnalysis: false,
     };
     AppState.chatMessages[ticketId] = AppState.chatMessages[ticketId] || [];
     AppState.chatMessages[ticketId].push(msg);
   
     const chatEl = document.getElementById(`chat-messages-${ticketId}`);
     if (chatEl) {
       chatEl.insertAdjacentHTML('beforeend', renderMessage(msg));
       // Typing indicator
       const typingId = `typing-${Date.now()}`;
       chatEl.insertAdjacentHTML('beforeend', `
         <div class="msg fade-in" id="${typingId}">
           <div class="msg-avatar ai">AI</div>
           <div class="msg-bubble" style="background:var(--bg)">
             <div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
           </div>
         </div>
       `);
       chatEl.scrollTop = chatEl.scrollHeight;
   
       // Simulated AI response
       setTimeout(() => {
         const typingEl = document.getElementById(typingId);
         if (typingEl) typingEl.remove();
         const aiResp = generateAIResponse(text);
         AppState.chatMessages[ticketId].push(aiResp);
         chatEl.insertAdjacentHTML('beforeend', renderMessage(aiResp));
         chatEl.scrollTop = chatEl.scrollHeight;
       }, 1400 + Math.random() * 800);
     }
   }
   
   function chatKeydown(e, id) {
     if (e.key === 'Enter') sendMessage(id);
   }
   
   function generateAIResponse(userText) {
     const responses = [
       'He analizado el mensaje y detecto que requiere acción inmediata. Sugiero aplicar la política de reembolso automático #PR-04 dado que el cliente es Premium.',
       'Basado en el historial de este cliente y tickets similares, la resolución estimada es de 2-4 horas hábiles. ¿Deseas que genere un borrador de respuesta formal?',
       'Detecté palabras clave relacionadas con facturación. He verificado con el sistema de pagos y confirmo la anomalía. Recomiendo proceder con nota de crédito.',
       'Según la política de SLA, este ticket tiene prioridad Alta. Sugiero escalar al equipo de Nivel 2 para garantizar resolución en tiempo.',
       'He revisado casos similares (#TK-2024-071, #TK-2024-063). El patrón coincide con el incidente de lote del día 15. Aplicar solución masiva recomendada.',
     ];
     return {
       role: 'ai-analysis',
       name: 'Aura IA',
       avatar: 'AI',
       analysis: { intención: detectIntent(userText), urgencia: 'Media', sentimiento: 'Neutral' },
       text: responses[Math.floor(Math.random() * responses.length)],
       time: formatTime(new Date()),
     };
   }
   
   function detectIntent(text) {
     const t = text.toLowerCase();
     if (t.includes('reembolso') || t.includes('cobro') || t.includes('pago')) return 'Reembolso / Pago';
     if (t.includes('error') || t.includes('falla') || t.includes('problema')) return 'Soporte Técnico';
     if (t.includes('cancelar') || t.includes('anular')) return 'Cancelación';
     if (t.includes('actualizar') || t.includes('cambiar')) return 'Actualización de Datos';
     return 'Consulta General';
   }
   
   function setTab(btn, type) {
     btn.closest('.chat-tabs').querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
     btn.classList.add('active');
     const input = btn.closest('.chat-input-area').querySelector('.chat-input');
     if (input) input.placeholder = type === 'interna' ? 'Escribe nota interna (solo agentes)…' : 'Escribe respuesta para el cliente…';
   }
   
   // AI Generators
   function genRespuesta(id) {
     const pqrs = AppState.pqrs.find(p => p.id === id);
     if (!pqrs) return;
     openModal(`
       <div class="modal-title">✍️ Borrador IA — Respuesta Formal</div>
       <div class="modal-subtitle">Generado automáticamente para #${id}</div>
       <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:14px;font-size:.83rem;line-height:1.7;margin-bottom:18px;color:var(--text-primary)">
         Estimado/a ${pqrs.solicitante},<br><br>
         Hemos recibido su ${pqrs.tipo.toLowerCase()} con referencia <strong>#${id}</strong> relacionada con: <em>${pqrs.asunto}</em>.<br><br>
         Nuestro equipo ha tomado nota de su situación y estamos trabajando activamente para brindarle una solución en el menor tiempo posible. Le informamos que su caso ha sido clasificado como <strong>${pqrs.prioridad}</strong> y cuenta con atención prioritaria.<br><br>
         Nos comunicaremos con usted a la brevedad.<br><br>
         Atentamente,<br>
         Equipo de Soporte AuraDesk
       </div>
       <div class="form-actions">
         <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
         <button class="btn-primary" onclick="applyDraft('${id}');closeModal()">Usar este borrador</button>
       </div>
     `);
   }
   function genTraducir(id) { showToast('info','Traducción IA','Procesando traducción al inglés…'); }
   function genResumen(id) {
     const pqrs = AppState.pqrs.find(p => p.id === id);
     const el = document.getElementById(`ai-summary-${id}`);
     if (el) { el.textContent = `RESUMEN (IA): Cliente ${pqrs.solicitante} reporta ${pqrs.tipo} de ${pqrs.prioridad} prioridad en categoría ${pqrs.categoria}. "${pqrs.descripcion.substring(0,120)}…" Acción sugerida: resolución en 4h.`; }
     showToast('success', 'Resumen actualizado', 'El resumen de IA ha sido regenerado.');
   }
   function genPolitica(id) { showToast('info','Verificando política…','Consultando base de conocimiento interna.'); }
   function applyDraft(id) {
     const input = document.getElementById(`chat-input-${id}`);
     const pqrs = AppState.pqrs.find(p => p.id === id);
     if (input && pqrs) input.value = `Estimado/a ${pqrs.solicitante}, hemos recibido su ${pqrs.tipo.toLowerCase()} y estamos trabajando en ella. Nos comunicaremos pronto.`;
   }
   function reassignTicket(id) {
     const pqrs = AppState.pqrs.find(p => p.id === id);
     if (!pqrs) return;
     pqrs.agente = 'Elena Rojas';
     pqrs.fechaActualizacion = new Date().toISOString();
     showToast('success', 'Ticket reasignado', `#${id} ahora está asignado a Elena Rojas.`);
     navigateTo('ticket');
   }
   function searchKB(e) { if (e.key === 'Enter') showToast('info','Búsqueda KB','Consultando base de conocimiento…'); }
   function showHistorial(id) {
     openModal(`
       <div class="modal-title">📋 Historial del Ticket #${id}</div>
       <div class="modal-subtitle">Registro de cambios y actividades</div>
       ${[
         { icon:'🟢', text:'Ticket creado', time:'Hoy 08:30 AM' },
         { icon:'🔵', text:'Asignado a Carlos Mendoza', time:'Hoy 08:32 AM' },
         { icon:'🤖', text:'IA analizó el ticket automáticamente', time:'Hoy 08:31 AM' },
         { icon:'📝', text:'Estado cambiado: Abierto → En Proceso', time:'Hoy 09:00 AM' },
       ].map(h => `
         <div class="activity-item">
           <div style="font-size:1rem">${h.icon}</div>
           <div class="activity-content">
             <div class="activity-text">${h.text}</div>
             <div class="activity-time">${h.time}</div>
           </div>
         </div>
       `).join('')}
       <button class="btn-secondary" style="width:100%;margin-top:16px" onclick="closeModal()">Cerrar</button>
     `);
   }
   
   /* =============================================
      VIEW: TEAMS
      ============================================= */
   function renderTeams(container) {
     const teams = [
       { name: 'Soporte Nivel 1', emoji: '🟢', members: 5, open: 23, desc: 'Atención inicial y casos estándar' },
       { name: 'Soporte Nivel 2', emoji: '🔵', members: 3, open: 8, desc: 'Casos escalados y técnicos' },
       { name: 'Facturación', emoji: '💛', members: 4, open: 12, desc: 'Pagos, reembolsos y cobros' },
       { name: 'Comercial', emoji: '🟣', members: 6, open: 4, desc: 'Ventas, contratos y cambios de plan' },
       { name: 'Aura IA', emoji: '🤖', members: 1, open: 45, desc: 'Agente virtual de resolución automática' },
     ];
   
     container.innerHTML = `
       <div class="page-header">
         <div class="flex-row">
           <div><h1 class="page-title">Equipos</h1><p class="page-subtitle">Gestiona los equipos de soporte y sus capacidades.</p></div>
           <button class="btn-primary" style="margin-left:auto" onclick="showToast('info','Nuevo equipo','Funcionalidad disponible próximamente.')">+ Nuevo Equipo</button>
         </div>
       </div>
       <div class="simple-section">
         ${teams.map(t => `
           <div class="team-card">
             <div class="team-icon" style="background:var(--bg)">${t.emoji}</div>
             <div class="team-info">
               <div class="team-name">${t.name}</div>
               <div class="team-members">${t.desc} · ${t.members} miembro${t.members>1?'s':''}</div>
             </div>
             <span class="badge badge-blue">${t.open} tickets activos</span>
             <button class="action-btn" onclick="showToast('info','Equipo','Ver detalle de ${t.name}')">Ver →</button>
           </div>
         `).join('')}
       </div>
     `;
   }
   
   /* =============================================
      VIEW: SETTINGS
      ============================================= */
   function renderSettings(container) {
     const settings = [
       { name: 'Notificaciones por Email', desc: 'Recibir alertas por correo electrónico', enabled: true },
       { name: 'Respuestas Automáticas IA', desc: 'Permitir a Aura IA responder tickets automáticamente', enabled: true },
       { name: 'Escalado Automático', desc: 'Escalar tickets vencidos sin intervención manual', enabled: false },
       { name: 'Modo Oscuro', desc: 'Cambiar tema de la interfaz a modo oscuro', enabled: false },
       { name: 'Alertas de SLA', desc: 'Notificar 1 hora antes del vencimiento del SLA', enabled: true },
       { name: 'Análisis Predictivo', desc: 'Usar IA para predecir volumen de tickets', enabled: false },
     ];
   
     container.innerHTML = `
       <div class="page-header">
         <h1 class="page-title">Ajustes</h1>
         <p class="page-subtitle">Configuración general del sistema AuraDesk.</p>
       </div>
       <div class="simple-section">
         <div style="font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:12px">Preferencias del Sistema</div>
         ${settings.map((s, i) => `
           <div class="setting-row">
             <div class="setting-info">
               <div class="setting-name">${s.name}</div>
               <div class="setting-desc">${s.desc}</div>
             </div>
             <label class="toggle">
               <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="toggleSetting(this, '${s.name}')"/>
               <span class="toggle-track"></span>
               <span class="toggle-thumb"></span>
             </label>
           </div>
         `).join('')}
         <div style="margin-top:20px;display:flex;gap:10px">
           <button class="btn-primary" onclick="showToast('success','Ajustes guardados','Los cambios se han aplicado correctamente.')">Guardar Cambios</button>
           <button class="btn-secondary" onclick="showToast('info','Restaurar','Configuración restaurada a valores por defecto.')">Restaurar Predeterminados</button>
         </div>
       </div>
     `;
   }
   
   function toggleSetting(input, name) {
     showToast(input.checked ? 'success' : 'info', `${name}`, input.checked ? 'Activado correctamente.' : 'Desactivado.');
   }
   
   /* =============================================
      CHART HELPERS
      ============================================= */
   const donutColors = ['var(--blue)', 'var(--red)', 'var(--amber)', 'var(--green)'];
   
   function renderLineChart(data1, data2) {
     const w = 520, h = 160, pad = { t: 10, b: 30, l: 30, r: 10 };
     const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
     const max = Math.max(...data1, ...data2, 1);
     const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
     const toX = i => pad.l + (i / (data1.length - 1)) * cw;
     const toY = v => pad.t + ch - (v / max) * ch;
     const path = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
     const area = (arr, color) => `<path d="${path(arr)} L ${toX(arr.length-1)} ${pad.t+ch} L ${pad.l} ${pad.t+ch} Z" fill="${color}" class="chart-area"/>`;
   
     return `
       <svg viewBox="0 0 ${w} ${h}" class="svg-chart">
         <g class="chart-grid">
           ${[0,.25,.5,.75,1].map(f => `<line x1="${pad.l}" y1="${pad.t + ch*f}" x2="${pad.l+cw}" y2="${pad.t + ch*f}" />`).join('')}
         </g>
         ${area(data1, 'var(--blue)')}
         ${area(data2, 'var(--green)')}
         <path d="${path(data1)}" stroke="var(--blue)" class="chart-line"/>
         <path d="${path(data2)}" stroke="var(--green)" class="chart-line"/>
         <g class="chart-axis">
           ${days.map((d,i) => `<text x="${toX(i)}" y="${h-4}" text-anchor="middle">${d}</text>`).join('')}
           ${[0,50,100].map(v => `<text x="${pad.l-4}" y="${toY(v)+4}" text-anchor="end">${v}</text>`).join('')}
         </g>
       </svg>
     `;
   }
   
   function renderMultiLineChart() {
     const sets = [
       { color: 'var(--blue)', data: [5,8,15,22,30,25,18,10,8,6] },
       { color: 'var(--purple)', data: [8,12,20,30,28,22,15,12,9,7] },
       { color: 'var(--green)', data: [10,15,25,35,30,24,17,14,11,8] },
     ];
     const w = 380, h = 160, pad = { t: 10, b: 30, l: 30, r: 10 };
     const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
     const max = 38;
     const hours = ['08:00','10:00','12:00','14:00','16:00','18:0'];
     const toX = i => pad.l + (i / (sets[0].data.length - 1)) * cw;
     const toY = v => pad.t + ch - (v / max) * ch;
     const path = (arr) => arr.map((v, i) => `${i===0?'M':'L'} ${toX(i)} ${toY(v)}`).join(' ');
   
     return `
       <svg viewBox="0 0 ${w} ${h}" class="svg-chart">
         <g class="chart-grid">${[0,.25,.5,.75,1].map(f=>`<line x1="${pad.l}" y1="${pad.t+ch*f}" x2="${pad.l+cw}" y2="${pad.t+ch*f}"/>`).join('')}</g>
         ${sets.map(s=>`<path d="${path(s.data)}" stroke="${s.color}" class="chart-line"/>`).join('')}
         <g class="chart-axis">${hours.map((h,i)=>`<text x="${pad.l+(i/(hours.length-1))*cw}" y="${160-4}" text-anchor="middle">${h}</text>`).join('')}</g>
       </svg>
     `;
   }
   
   function renderBarChart() {
     const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
     const manual = [40,50,55,35,50,20,15];
     const ai = [25,35,30,60,50,15,10];
     const w = 320, h = 160, pad = { t: 10, b: 30, l: 20, r: 10 };
     const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
     const max = 110;
     const bw = (cw / days.length) * 0.4;
     const gap = (cw / days.length);
   
     return `
       <svg viewBox="0 0 ${w} ${h}" class="svg-chart">
         <g class="chart-grid">${[0,.33,.66,1].map(f=>`<line x1="${pad.l}" y1="${pad.t+ch*f}" x2="${pad.l+cw}" y2="${pad.t+ch*f}"/>`).join('')}</g>
         ${days.map((d,i)=>{
           const cx = pad.l + i * gap + gap/2;
           const mH = (manual[i]/max)*ch;
           const aH = (ai[i]/max)*ch;
           return `
             <rect x="${cx-bw-1}" y="${pad.t+ch-mH}" width="${bw}" height="${mH}" fill="var(--border)" rx="2"/>
             <rect x="${cx+1}" y="${pad.t+ch-aH}" width="${bw}" height="${aH}" fill="var(--blue)" rx="2"/>
             <text class="chart-axis" x="${cx}" y="${h-4}" text-anchor="middle" style="font-size:9px;fill:var(--text-muted)">${d}</text>
           `;
         }).join('')}
       </svg>
     `;
   }
   
   function renderDonutChart(data, total) {
     const size = 100, cx = 50, cy = 50, r = 36, stroke = 14;
     let offset = 0;
     const circumference = 2 * Math.PI * r;
     const slices = data.map((d, i) => {
       const pct = d.count / total;
       const dasharray = `${pct * circumference} ${circumference}`;
       const dashoffset = -offset * circumference;
       offset += pct;
       return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${donutColors[i]}" stroke-width="${stroke}" stroke-dasharray="${dasharray}" stroke-dashoffset="${dashoffset}" transform="rotate(-90 ${cx} ${cy})" style="transition:stroke-dasharray .8s ease"/>`;
     });
   
     return `
       <svg viewBox="0 0 ${size} ${size}" width="100" height="100">
         ${slices.join('')}
         <text x="${cx}" y="${cy+4}" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--text-primary);font-family:var(--font)">${total}</text>
         <text x="${cx}" y="${cy+14}" text-anchor="middle" style="font-size:6px;fill:var(--text-muted);font-family:var(--font)">Total</text>
       </svg>
     `;
   }
   
   /* =============================================
      MODAL
      ============================================= */
   function openModal(html) {
     document.getElementById('modal-body').innerHTML = html;
     document.getElementById('modal-overlay').classList.add('open');
   }
   function closeModal() {
     document.getElementById('modal-overlay').classList.remove('open');
   }
   
   /* =============================================
      TOAST
      ============================================= */
   function showToast(type, title, text) {
     const container = document.getElementById('toast-container');
     const id = `toast-${Date.now()}`;
     const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
     const toast = document.createElement('div');
     toast.className = `toast ${type}`;
     toast.id = id;
     toast.innerHTML = `
       <span style="font-size:1rem;flex-shrink:0">${icons[type] || 'ℹ️'}</span>
       <div class="toast-content">
         <div class="toast-title">${title}</div>
         ${text ? `<div class="toast-text">${text}</div>` : ''}
       </div>
       <button class="toast-close" onclick="removeToast('${id}')">×</button>
     `;
     container.appendChild(toast);
     setTimeout(() => removeToast(id), 4000);
   }
   function removeToast(id) {
     const el = document.getElementById(id);
     if (el) { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all .25s'; setTimeout(() => el.remove(), 250); }
   }
   
   /* =============================================
      HELPERS
      ============================================= */
   function tipoBadge(tipo) {
     return { 'Petición': 'badge-blue', 'Queja': 'badge-amber', 'Reclamo': 'badge-red', 'Sugerencia': 'badge-green' }[tipo] || 'badge-gray';
   }
   function estadoBadge(estado) {
     return { 'Abierto': 'badge-blue', 'En Proceso': 'badge-amber', 'Resuelto': 'badge-green', 'Cerrado': 'badge-gray', 'Pendiente': 'badge-purple' }[estado] || 'badge-gray';
   }
   function prioDot(prio) {
     return { 'Crítica': 'prio-critica', 'Alta': 'prio-alta', 'Media': 'prio-media', 'Baja': 'prio-baja' }[prio] || '';
   }
   function estadoColor(estado) {
     return { 'Abierto': 'var(--blue)', 'En Proceso': 'var(--amber)', 'Resuelto': 'var(--green)', 'Cerrado': 'var(--text-muted)', 'Pendiente': 'var(--purple)' }[estado] || 'var(--text-muted)';
   }
   function tipoEmoji(tipo) {
     return { 'Petición': '📋', 'Queja': '😠', 'Reclamo': '⚠️', 'Sugerencia': '💡' }[tipo] || '📌';
   }
   function timeAgo(iso) {
     const diff = Date.now() - new Date(iso).getTime();
     const m = Math.floor(diff / 60000);
     if (m < 1) return 'hace un momento';
     if (m < 60) return `hace ${m} min`;
     const h = Math.floor(m / 60);
     if (h < 24) return `hace ${h} hr${h>1?'s':''}`;
     return `hace ${Math.floor(h/24)} día${Math.floor(h/24)>1?'s':''}`;
   }
   function formatDate(iso) {
     const d = new Date(iso);
     return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
   }
   function formatTime(date) {
     return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
   }
   
   /* =============================================
      INIT
      ============================================= */
   document.addEventListener('DOMContentLoaded', () => {
     initData();
   
     // Nav clicks
     document.querySelectorAll('.nav-item[data-view]').forEach(el => {
       el.addEventListener('click', (e) => {
         e.preventDefault();
         navigateTo(el.dataset.view);
       });
     });
   
     // Sidebar toggle (mobile)
     document.getElementById('sidebar-toggle').addEventListener('click', () => {
       const sidebar = document.getElementById('sidebar');
       sidebar.classList.toggle('open');
     });
   
     // Global search
     document.getElementById('global-search').addEventListener('input', (e) => {
       const q = e.target.value.trim();
       if (q.length > 1) {
         AppState.searchQuery = q;
         navigateTo('management');
       }
     });
     document.getElementById('global-search').addEventListener('keydown', (e) => {
       if (e.key === 'Escape') { e.target.value = ''; AppState.searchQuery = ''; }
     });
   
     // New ticket button
     document.getElementById('new-ticket-btn').addEventListener('click', () => navigateTo('create'));
   
     // Notification button
     document.getElementById('notif-btn').addEventListener('click', () => {
       openModal(`
         <div class="modal-title">🔔 Notificaciones</div>
         <div class="modal-subtitle">3 notificaciones sin leer</div>
         ${[
           { icon:'🚨', title:'SLA en riesgo', text:'El ticket #TK-2024-089 vence en 45 minutos.', time:'Hace 5 min' },
           { icon:'📈', title:'Pico de demanda', text:'Incremento del 35% en tickets de Facturación.', time:'Hace 20 min' },
           { icon:'✅', title:'Resolución automática', text:'12 tickets resueltos por Aura IA hoy.', time:'Hace 1 hr' },
         ].map(n=>`
           <div class="activity-item">
             <div style="font-size:1.2rem">${n.icon}</div>
             <div class="activity-content">
               <div class="activity-text"><strong>${n.title}</strong><br>${n.text}</div>
               <div class="activity-time">${n.time}</div>
             </div>
           </div>
         `).join('')}
         <button class="btn-secondary" style="width:100%;margin-top:12px" onclick="closeModal()">Marcar todas como leídas</button>
       `);
     });
   
     // Modal close
     document.getElementById('modal-close').addEventListener('click', closeModal);
     document.getElementById('modal-overlay').addEventListener('click', (e) => {
       if (e.target === document.getElementById('modal-overlay')) closeModal();
     });
   
     // Keyboard shortcut ⌘K
     document.addEventListener('keydown', (e) => {
       if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
         e.preventDefault();
         document.getElementById('global-search').focus();
       }
       if (e.key === 'Escape') closeModal();
     });
   
     // Initial render
     navigateTo('dashboard');
     showToast('success', '¡Bienvenido, Carlos!', 'AuraDesk está listo. Tienes 3 tickets de alta prioridad.');
   });