import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Experiencias del Destino</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tu puerta de entrada a las experiencias más auténticas de España.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Experiencias</h4>
            <ul className="space-y-2">
              <li><Link to="/experiencias" className="text-sm hover:text-orange-500 transition-colors">Todas las experiencias</Link></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">Gastronómicas</a></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">Culturales</a></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">Aventura</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li><Link to="/sobre-nosotros" className="text-sm hover:text-orange-500 transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/contacto" className="text-sm hover:text-orange-500 transition-colors">Contacto</Link></li>
              <li><a href="#" className="text-sm hover:text-orange-500 transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="tel:+34900300111" className="hover:text-orange-500 transition-colors">+34 900 300 111</a></li>
              <li><a href="mailto:info@experienciasdeldestino.com" className="hover:text-orange-500 transition-colors">info@experienciasdeldestino.com</a></li>
              <li className="text-gray-400">Lun-Vie 09:00-18:00</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Experiencias del Destino. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;