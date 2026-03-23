import Header from '../../components/Header';
import Footer from '../../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Sobre Nosotros</h1>
            <p className="text-xl text-orange-100">Conectando personas con experiencias auténticas</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="prose prose-lg">
            <p className="text-gray-700 leading-relaxed mb-6">
              Experiencias del Destino es una plataforma que conecta a viajeros con experiencias auténticas
              y únicas en toda España. Trabajamos con productores locales y delegados regionales para
              ofrecer las mejores experiencias turísticas.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Nuestro modelo de franquicia permite a emprendedores locales crear y gestionar experiencias
              en sus regiones, promoviendo el turismo sostenible y el desarrollo económico local.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;