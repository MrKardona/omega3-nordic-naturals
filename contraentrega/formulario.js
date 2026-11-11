/* Formulario de contraentrega para las landings de Importaciones JOG.
 * Intercepta los enlaces a /cart-link/ y abre una ventana para pedir y pagar al recibir.
 * El pedido lo crea el puente (integracion-effi/src/formulario.mjs) en Tiendanube y entra a Effi.
 * Uso:
 *   <script src="https://omega3.importacionesjog.com/contraentrega/formulario.js" defer
 *     data-producto="272529100" data-variante="1217223841" data-nombre="Omega-3 Nordic Naturals"
 *     data-precio="139900" data-imagen="https://.../foto.webp"></script>
 * Las escalas de descuento deben coincidir con ESCALAS_DESCUENTO del puente y la promoción de Tiendanube.
 */
(function () {
	var script = document.currentScript;
	var PRODUCTO = Number(script.getAttribute('data-producto'));
	var VARIANTE = Number(script.getAttribute('data-variante'));
	var NOMBRE = script.getAttribute('data-nombre') || '';
	var PRECIO = Number(script.getAttribute('data-precio'));
	var IMAGEN = script.getAttribute('data-imagen') || '';
	var BASE = new URL('.', script.src).href;
	var PUENTE = 'https://puente-tiendanube-effi.integracion-effi.workers.dev/formulario';
	var CIUDADES = BASE + 'ciudades.json';
	var LOGOS = BASE + '../pie/medios-de-pago.svg';
	var TIENDA = 'https://www.importacionesjog.com';
	var WHATSAPP = '573106609145';
	var ESCALAS = [{ desde: 3, descuento: 0.10 }, { desde: 2, descuento: 0.05 }];
	if (!PRODUCTO || !VARIANTE || !(PRECIO > 0) || typeof HTMLDialogElement !== 'function') return;

	var css = ''
		+ '.ce{padding:0;border:0;max-width:none;max-height:none;width:100%;height:100%;background:transparent;color:#1c1c1e;font-family:inherit}'
		+ '.ce [hidden]{display:none!important}.ce *{box-sizing:border-box}'
		+ '.ce::backdrop{background:rgba(20,20,22,.55)}'
		+ '.ce[open]{display:flex;align-items:flex-end;justify-content:center}'
		+ '.ce__caja{position:relative;width:100%;max-height:94dvh;overflow:auto;background:#fff;border-radius:16px 16px 0 0;padding:0 18px 22px;animation:ce-sube .28s cubic-bezier(.16,1,.3,1);overscroll-behavior:contain;text-align:left}'
		+ '@media (min-width:768px){.ce[open]{align-items:center}.ce__caja{max-width:520px;border-radius:16px;max-height:90dvh;padding:0 28px 28px}}'
		+ '@keyframes ce-sube{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}'
		+ '.ce__cabecera{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;background:#fff;padding:16px 0 12px;border-bottom:1px solid #ececee;margin-bottom:14px}'
		+ '.ce__titulo{margin:0;font-size:18px;font-weight:700;letter-spacing:-.01em;color:#1c1c1e}'
		+ '.ce__cerrar{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:50%;background:#f3f3f5;cursor:pointer;padding:0}'
		+ '.ce__cerrar svg{width:18px;height:18px;stroke:#1c1c1e;stroke-width:2;fill:none}'
		+ '.ce__producto{display:flex;align-items:center;gap:12px;margin-bottom:14px}'
		+ '.ce__imagen{width:56px;height:56px;object-fit:contain;border-radius:10px;background:#f6f6f7;flex-shrink:0}'
		+ '.ce__nombre{margin:0;font-weight:600;font-size:15px;line-height:1.3}'
		+ '.ce__ofertas{border:0;padding:0;margin:0 0 14px}'
		+ '.ce__legenda{font-size:14px;font-weight:600;margin-bottom:8px;padding:0}'
		+ '.ce__oferta{position:relative;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:13px 14px;border:1.5px solid #dcdce0;border-radius:12px;margin-bottom:8px;cursor:pointer;transition:border-color .15s,background .15s}'
		+ '.ce__oferta.is-elegida{border-color:#1c1c1e;background:#f7f7f8}'
		+ '.ce__oferta input{position:absolute;opacity:0;pointer-events:none}'
		+ '.ce__oferta:focus-within{outline:2px solid #1c1c1e;outline-offset:2px}'
		+ '.ce__radio{width:20px;height:20px;border:1.5px solid #9a9aa0;border-radius:50%;display:grid;place-items:center}'
		+ '.ce__oferta.is-elegida .ce__radio{border-color:#1c1c1e}.ce__oferta.is-elegida .ce__radio::after{content:"";width:10px;height:10px;border-radius:50%;background:#1c1c1e}'
		+ '.ce__oferta-nombre{font-weight:600;font-size:15px}.ce__oferta-detalle{display:block;font-size:13px;opacity:.7;margin-top:2px}'
		+ '.ce__oferta-precio{text-align:right;font-weight:700;font-size:15px;font-variant-numeric:tabular-nums}'
		+ '.ce__oferta-antes{display:block;font-weight:400;font-size:12px;text-decoration:line-through;opacity:.55}'
		+ '.ce__etiqueta{display:inline-block;margin-left:6px;padding:2px 7px;border-radius:6px;background:#e31e24;color:#fff;font-size:11px;font-weight:700;vertical-align:2px}'
		+ '.ce__resumen{margin:0 0 20px;padding:14px;border-radius:12px;background:#f6f6f7;font-size:14px}'
		+ '.ce__resumen div{display:flex;justify-content:space-between;gap:12px;padding:3px 0}.ce__resumen dt{font-weight:400}.ce__resumen dd{margin:0;font-variant-numeric:tabular-nums}'
		+ '.ce__ahorro dd{color:#1a7f37;font-weight:600}'
		+ '.ce__total{border-top:1px solid #e2e2e5;margin-top:6px;padding-top:9px!important;font-weight:700;font-size:16px}.ce__total dt{font-weight:700}'
		+ '.ce__subtitulo{font-size:15px;font-weight:700;margin:0 0 12px;color:#1c1c1e}'
		+ '.ce__fila{display:grid;grid-template-columns:1fr;gap:0 12px}@media (min-width:480px){.ce__fila{grid-template-columns:1fr 1fr}}'
		+ '.ce__campo{margin-bottom:12px}.ce__campo label{display:block;font-size:13px;font-weight:600;margin-bottom:5px}'
		+ '.ce__opcional{font-weight:400;opacity:.6}'
		+ '.ce__control{display:block;width:100%;height:46px;padding:0 12px;border:1.5px solid #dcdce0;border-radius:10px;background:#fff;font:inherit;font-size:16px;color:#1c1c1e;appearance:none;-webkit-appearance:none}'
		+ 'select.ce__control{background:#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231c1c1e\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 10px center/16px;padding-right:34px}'
		+ '.ce__control:focus{outline:none;border-color:#1c1c1e;box-shadow:0 0 0 3px rgba(28,28,30,.12)}'
		+ '.ce__control[aria-invalid="true"]{border-color:#e31e24}.ce__control:disabled{background-color:#f3f3f5;opacity:.7}'
		+ '.ce__trampa{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}'
		+ '.ce__error{margin:4px 0 12px;padding:11px 13px;border-radius:10px;background:#fdecec;color:#9f1418;font-size:14px;line-height:1.45}.ce__error ul{margin:0;padding-left:18px}'
		+ '.ce__enviar{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:54px;border:0;border-radius:12px;background:#e31e24;color:#fff;font:inherit;font-size:16px;font-weight:700;cursor:pointer;text-decoration:none}'
		+ '.ce__enviar:hover{background:#c8161c;color:#fff}.ce__enviar:active{transform:scale(.98)}.ce__enviar[disabled]{opacity:.7;cursor:progress}'
		+ '.ce__enviar--oscuro{background:#1c1c1e}.ce__enviar--oscuro:hover{background:#000}'
		+ '.ce__icono{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;flex-shrink:0}'
		+ '.ce__legal{margin:10px 0 0;font-size:12px;line-height:1.5;opacity:.7;text-align:center}.ce__legal a{color:inherit;text-decoration:underline}'
		+ '.ce__anticipado{margin-top:22px;padding-top:18px;border-top:1px solid #ececee;text-align:center}'
		+ '.ce__anticipado-titulo{margin:0 0 4px;font-size:15px;font-weight:700}'
		+ '.ce__anticipado-texto{margin:0 auto 12px;font-size:13px;line-height:1.5;max-width:40ch;opacity:.8}'
		+ '.ce__anticipado-logos{display:block;width:100%;max-width:330px;height:auto;margin:0 auto 12px}'
		+ '.ce__checkout{display:flex;align-items:center;justify-content:center;width:100%;min-height:50px;border:0;border-radius:12px;background:#4ade80;color:#052e16;font:inherit;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;animation:ce-tiembla 4s ease-in-out 1s infinite}'
		+ '.ce__checkout:hover{background:#22c55e;color:#052e16;animation-play-state:paused}'
		+ '@keyframes ce-tiembla{0%,14%,100%{transform:translateX(0) rotate(0)}2%{transform:translateX(-4px) rotate(-1deg)}4%{transform:translateX(4px) rotate(1deg)}6%{transform:translateX(-3px) rotate(-1deg)}8%{transform:translateX(3px) rotate(1deg)}10%{transform:translateX(-2px)}12%{transform:translateX(2px)}}'
		+ '@media (prefers-reduced-motion:reduce){.ce__caja,.ce__checkout{animation:none}}'
		+ '.ce__listo{text-align:center;padding:8px 0 4px;outline:none}'
		+ '.ce__listo-icono{width:64px;height:64px;margin:6px auto 14px;display:block;fill:none;stroke:#1a7f37;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}'
		+ '.ce__listo-titulo{font-size:20px;font-weight:700;margin:0 0 8px}.ce__listo-texto{font-size:15px;line-height:1.5;margin:0 auto 20px;max-width:36ch}'
		+ '.ce__seguir{margin-top:10px;border:0;background:none;font:inherit;font-size:14px;text-decoration:underline;cursor:pointer;color:#1c1c1e}';

	var billete = '<svg class="ce__icono" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/></svg>';
	var html = ''
		+ '<div class="ce__caja">'
		+ '<header class="ce__cabecera"><h2 id="ce-titulo" class="ce__titulo">Pide y paga al recibir</h2>'
		+ '<button type="button" class="js-ce-cerrar ce__cerrar" aria-label="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>'
		+ '<form class="js-ce-form ce__form" novalidate>'
		+ '<div class="ce__producto"><img class="ce__imagen" alt="" width="56" height="56"><p class="ce__nombre"></p></div>'
		+ '<fieldset class="ce__ofertas"><legend class="ce__legenda">Elige cuántas unidades</legend><div class="js-ce-ofertas"></div></fieldset>'
		+ '<dl class="ce__resumen"><div><dt>Subtotal</dt><dd class="js-ce-subtotal"></dd></div>'
		+ '<div class="js-ce-ahorro-fila ce__ahorro" hidden><dt class="js-ce-ahorro-texto"></dt><dd class="js-ce-ahorro"></dd></div>'
		+ '<div><dt>Envío</dt><dd>Gratis</dd></div><div class="ce__total"><dt>Total a pagar al recibir</dt><dd class="js-ce-total"></dd></div></dl>'
		+ '<h3 class="ce__subtitulo">Datos de entrega</h3>'
		+ '<div class="ce__campo"><label for="ce-nombre">Nombre y apellido</label><input id="ce-nombre" name="nombre" class="ce__control" autocomplete="name" required maxlength="80" placeholder="Ej: Laura Gómez"></div>'
		+ '<div class="ce__campo"><label for="ce-telefono">Celular (WhatsApp)</label><input id="ce-telefono" name="telefono" class="ce__control" type="tel" inputmode="numeric" autocomplete="tel-national" required maxlength="14" placeholder="300 123 4567"></div>'
		+ '<div class="ce__fila"><div class="ce__campo"><label for="ce-departamento">Departamento</label><select id="ce-departamento" name="departamento" class="js-ce-departamento ce__control" required><option value="">Cargando…</option></select></div>'
		+ '<div class="ce__campo"><label for="ce-ciudad">Ciudad o municipio</label><select id="ce-ciudad" name="ciudad" class="js-ce-ciudad ce__control" required disabled><option value="">Elige el departamento</option></select></div></div>'
		+ '<div class="ce__campo"><label for="ce-direccion">Dirección</label><input id="ce-direccion" name="direccion" class="ce__control" autocomplete="address-line1" required maxlength="150" placeholder="Ej: Calle 10 # 43-12"></div>'
		+ '<div class="ce__fila"><div class="ce__campo"><label for="ce-barrio">Barrio</label><input id="ce-barrio" name="barrio" class="ce__control" required maxlength="80"></div>'
		+ '<div class="ce__campo"><label for="ce-detalles">Apto, casa o torre <span class="ce__opcional">(opcional)</span></label><input id="ce-detalles" name="detalles" class="ce__control" autocomplete="address-line2" maxlength="100"></div></div>'
		+ '<div class="ce__campo"><label for="ce-correo">Correo <span class="ce__opcional">(opcional, para la confirmación)</span></label><input id="ce-correo" name="correo" class="ce__control" type="email" autocomplete="email" maxlength="100"></div>'
		+ '<div class="ce__trampa" aria-hidden="true"><label for="ce-sitio">No llenar</label><input id="ce-sitio" name="sitio_web" tabindex="-1" autocomplete="off"></div>'
		+ '<div class="js-ce-error ce__error" role="alert" hidden></div>'
		+ '<button type="submit" class="js-ce-enviar ce__enviar">' + billete + '<span class="js-ce-enviar-texto">Confirmar pedido</span></button>'
		+ '<p class="ce__legal">Pagas en efectivo cuando te llegue. Al confirmar aceptas los <a href="' + TIENDA + '/terminos-y-condiciones/" target="_blank">términos</a> y el <a href="' + TIENDA + '/politica-de-privacidad/" target="_blank">tratamiento de tus datos</a>.</p>'
		+ '<div class="ce__anticipado"><p class="ce__anticipado-titulo">¿Prefieres pagar ahora?</p>'
		+ '<p class="ce__anticipado-texto">Con tarjeta, PSE o Nequi (ePayco) tienes <strong>5% de descuento adicional</strong>, que se aplica en el pago.</p>'
		+ '<img class="ce__anticipado-logos" src="' + LOGOS + '" width="390" height="24" loading="lazy" alt="Visa, Mastercard, American Express, Diners Club, Codensa, PSE, Mercado Pago, Daviplata y Efecty">'
		+ '<a class="js-ce-checkout ce__checkout">Pagar ahora con 5% de descuento</a></div>'
		+ '</form>'
		+ '<div class="js-ce-listo ce__listo" hidden tabindex="-1"><svg class="ce__listo-icono" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><path d="M14 24.5l7 7 13-14"/></svg>'
		+ '<h3 class="js-ce-listo-titulo ce__listo-titulo"></h3><p class="js-ce-listo-texto ce__listo-texto"></p>'
		+ '<a class="js-ce-whatsapp ce__enviar ce__enviar--oscuro" target="_blank" rel="noopener">Escribirnos por WhatsApp</a>'
		+ '<button type="button" class="js-ce-cerrar ce__seguir">Seguir viendo</button></div>'
		+ '</div>';

	var estilo = document.createElement('style');
	estilo.textContent = css;
	document.head.appendChild(estilo);
	var dialogo = document.createElement('dialog');
	dialogo.className = 'ce';
	dialogo.setAttribute('aria-labelledby', 'ce-titulo');
	dialogo.innerHTML = html;
	document.body.appendChild(dialogo);

	var $ = function (sel) { return dialogo.querySelector(sel); };
	var form = $('.js-ce-form');
	var selDepto = $('.js-ce-departamento');
	var selCiudad = $('.js-ce-ciudad');
	var cajaError = $('.js-ce-error');
	var botonEnviar = $('.js-ce-enviar');
	var textoEnviar = $('.js-ce-enviar-texto');
	$('.ce__nombre').textContent = NOMBRE;
	if (IMAGEN) $('.ce__imagen').src = IMAGEN; else $('.ce__imagen').hidden = true;

	var plata = function (n) { return '$' + Math.round(n).toLocaleString('es-CO'); };
	var escapar = function (t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; };
	var descuentoPara = function (unidades) {
		for (var i = 0; i < ESCALAS.length; i++) if (unidades >= ESCALAS[i].desde) return ESCALAS[i].descuento;
		return 0;
	};
	var unidad = function (n) { return Math.round(PRECIO * (1 - descuentoPara(n))); };
	var cantidad = function () { var r = form.querySelector('input[name="cantidad"]:checked'); return r ? Number(r.value) : 1; };

	function pintarOfertas() {
		$('.js-ce-ofertas').innerHTML = [1, 2, 3].map(function (n) {
			var d = descuentoPara(n);
			return '<label class="ce__oferta"><input type="radio" name="cantidad" value="' + n + '"' + (n === 1 ? ' checked' : '') + '>'
				+ '<span class="ce__radio"></span>'
				+ '<span><span class="ce__oferta-nombre">' + (n === 1 ? '1 unidad' : 'Lleva ' + n) + (d ? '<span class="ce__etiqueta">' + Math.round(d * 100) + '% menos</span>' : '') + '</span>'
				+ '<span class="ce__oferta-detalle">' + (n === 1 ? 'Precio normal' : plata(unidad(n)) + ' cada uno') + '</span></span>'
				+ '<span class="ce__oferta-precio">' + (d ? '<span class="ce__oferta-antes">' + plata(PRECIO * n) + '</span>' : '') + plata(unidad(n) * n) + '</span></label>';
		}).join('');
	}

	function pintarResumen() {
		var n = cantidad();
		var d = descuentoPara(n);
		Array.prototype.forEach.call(form.querySelectorAll('.ce__oferta'), function (o) { o.classList.toggle('is-elegida', o.querySelector('input').checked); });
		$('.js-ce-subtotal').textContent = plata(PRECIO * n);
		$('.js-ce-ahorro-fila').hidden = !d;
		$('.js-ce-ahorro-texto').textContent = 'Descuento por cantidad (' + Math.round(d * 100) + '%)';
		$('.js-ce-ahorro').textContent = '-' + plata(PRECIO * n - unidad(n) * n);
		$('.js-ce-total').textContent = plata(unidad(n) * n);
		textoEnviar.textContent = 'Confirmar pedido · ' + plata(unidad(n) * n);
		$('.js-ce-checkout').href = TIENDA + '/cart-link/' + VARIANTE + '-' + n;
	}

	var ciudades = null;
	function cargarCiudades() {
		if (ciudades) return;
		fetch(CIUDADES).then(function (r) { return r.json(); }).then(function (datos) {
			ciudades = datos;
			selDepto.innerHTML = '<option value="">Elige</option>' + Object.keys(datos).map(function (d) { return '<option>' + d + '</option>'; }).join('');
		}).catch(function () {
			selDepto.innerHTML = '<option value="">No cargó la lista, cierra y vuelve a abrir</option>';
		});
	}

	selDepto.addEventListener('change', function () {
		var lista = (ciudades && ciudades[selDepto.value]) || [];
		selCiudad.disabled = !lista.length;
		selCiudad.innerHTML = '<option value="">' + (lista.length ? 'Elige' : 'Elige el departamento') + '</option>'
			+ lista.map(function (c) { return '<option>' + c + '</option>'; }).join('');
		if (lista.length === 1) selCiudad.value = lista[0];
	});

	function mostrarError(problemas) {
		cajaError.innerHTML = problemas.length > 1
			? '<ul>' + problemas.map(function (p) { return '<li>' + escapar(p) + '</li>'; }).join('') + '</ul>'
			: escapar(problemas[0]);
		cajaError.hidden = false;
		cajaError.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}

	function validar() {
		var problemas = [];
		var marcar = function (campo, malo) { campo.setAttribute('aria-invalid', malo ? 'true' : 'false'); };
		var f = form.elements;
		var nombre = f.nombre.value.trim().split(/\s+/).filter(Boolean);
		marcar(f.nombre, nombre.length < 2); if (nombre.length < 2) problemas.push('Escribe tu nombre y apellido.');
		var cel = f.telefono.value.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
		var celMalo = !/^3\d{9}$/.test(cel);
		marcar(f.telefono, celMalo); if (celMalo) problemas.push('Escribe un celular de 10 dígitos que empiece por 3.');
		marcar(f.departamento, !f.departamento.value); marcar(f.ciudad, !f.ciudad.value);
		if (!f.departamento.value || !f.ciudad.value) problemas.push('Elige el departamento y la ciudad.');
		var dirMala = f.direccion.value.trim().length < 5;
		marcar(f.direccion, dirMala); if (dirMala) problemas.push('Escribe la dirección completa.');
		var barrioMalo = f.barrio.value.trim().length < 2;
		marcar(f.barrio, barrioMalo); if (barrioMalo) problemas.push('Escribe el barrio.');
		var correo = f.correo.value.trim();
		var correoMalo = correo && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(correo);
		marcar(f.correo, correoMalo); if (correoMalo) problemas.push('Revisa el correo o déjalo vacío.');
		return problemas;
	}

	function rastrear(numero, total, n) {
		try { if (window.fbq) window.fbq('track', 'Purchase', { value: total, currency: 'COP', content_ids: [String(PRODUCTO)], content_type: 'product', num_items: n }, { eventID: 'formulario-' + numero }); } catch (e) {}
		try { if (window.gtag) window.gtag('event', 'purchase', { transaction_id: 'formulario-' + numero, value: total, currency: 'COP', payment_type: 'contraentrega', items: [{ item_id: String(PRODUCTO), item_name: NOMBRE, quantity: n, price: unidad(n) }] }); } catch (e) {}
	}

	form.addEventListener('change', function (e) { if (e.target.name === 'cantidad') pintarResumen(); });

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		cajaError.hidden = true;
		var problemas = validar();
		if (problemas.length) { mostrarError(problemas); return; }
		var f = form.elements;
		var n = cantidad();
		var datos = {
			productos: [{ producto: PRODUCTO, variante: VARIANTE, cantidad: n }],
			nombre: f.nombre.value, telefono: f.telefono.value, correo: f.correo.value,
			departamento: f.departamento.value, ciudad: f.ciudad.value,
			direccion: f.direccion.value, barrio: f.barrio.value, detalles: f.detalles.value,
			sitio_web: f.sitio_web.value
		};
		botonEnviar.disabled = true;
		textoEnviar.textContent = 'Enviando pedido…';
		fetch(PUENTE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) })
			.then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
			.then(function (r) {
				if (!r.ok) throw r;
				rastrear(r.numero, r.total, n);
				var nombre = f.nombre.value.trim().split(/\s+/)[0];
				$('.js-ce-listo-titulo').textContent = 'Pedido #' + r.numero + ' recibido';
				$('.js-ce-listo-texto').textContent = 'Gracias, ' + nombre + '. Pagas ' + plata(r.total) + ' en efectivo cuando te llegue. Si necesitamos confirmar algún dato te escribimos por WhatsApp.';
				$('.js-ce-whatsapp').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Hola, hice el pedido #' + r.numero + ' para pagar al recibir.');
				form.hidden = true;
				var listo = $('.js-ce-listo');
				listo.hidden = false;
				listo.focus();
			})
			.catch(function (r) {
				mostrarError((r && r.problemas) || ['No pudimos enviar el pedido. Revisa tu conexión e intenta de nuevo, o escríbenos por WhatsApp.']);
				botonEnviar.disabled = false;
				pintarResumen();
			});
	});

	function abrir() {
		cajaError.hidden = true;
		pintarResumen();
		cargarCiudades();
		dialogo.showModal();
		document.documentElement.style.overflow = 'hidden';
		try { if (window.fbq) window.fbq('track', 'InitiateCheckout', { currency: 'COP', value: PRECIO, content_ids: [String(PRODUCTO)], content_type: 'product' }); } catch (e) {}
	}

	dialogo.addEventListener('close', function () {
		document.documentElement.style.overflow = '';
		if (!$('.js-ce-listo').hidden) {
			form.reset();
			form.hidden = false;
			$('.js-ce-listo').hidden = true;
			botonEnviar.disabled = false;
		}
	});
	Array.prototype.forEach.call(dialogo.querySelectorAll('.js-ce-cerrar'), function (b) { b.addEventListener('click', function () { dialogo.close(); }); });
	dialogo.addEventListener('click', function (e) { if (e.target === dialogo) dialogo.close(); });

	// Los botones "Comprar ahora" de la landing abren el formulario en vez de ir al carrito.
	document.addEventListener('click', function (e) {
		var enlace = e.target.closest && e.target.closest('a[href*="/cart-link/"]');
		if (!enlace || dialogo.contains(enlace) || e.ctrlKey || e.metaKey || e.shiftKey) return;
		e.preventDefault();
		abrir();
	});

	pintarOfertas();
	pintarResumen();
	window.jogContraentrega = { abrir: abrir };
})();
