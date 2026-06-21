// Se importan todos los filtros que forman la cadena de ingesta
const ExtensionFilter = require('./ExtensionFilter');
const FileReaderFilter = require('./FileReaderFilter');
const ParserFilter = require('./ParserFilter');
const CamposRequeridosFilter = require('./CamposRequeridosFilter');
const NormalizacionFilter = require('./NormalizacionFilter');
const PersistenciaFilter = require('./PersistenciaFilter');

// Construye la cadena completa de filtros de ingesta
function crearCadenaIngesta() {

    // Cada filtro tiene una responsabilidad específica.
    const extensionFilter = new ExtensionFilter();
    const fileReaderFilter = new FileReaderFilter();
    const parserFilter = new ParserFilter();
    // para estas dos mas se deja asi en ingles pero en realidad es normalizacion y campos requeridos verdad
    const camposRequeridosFilter = new CamposRequeridosFilter();
    const normalizacionFilter = new NormalizacionFilter();
    const persistenciaFilter = new PersistenciaFilter();

    // Se define el orden del flujo:
    // validar extensión, leer archivo, parsear, normalizar, validar y persistir
    extensionFilter.setNext(fileReaderFilter).setNext(parserFilter).setNext(normalizacionFilter).setNext(camposRequeridosFilter).setNext(persistenciaFilter);

    // Se devuelve el primer filtro, porque desde ahí inicia toda la cadena
    return extensionFilter;

}

module.exports = {
    crearCadenaIngesta
};