// aqui se trae pues todo basicamente de lo que se ha trabajado de la tarea 4 
const ExtensionFilter = require('./ExtensionFilter');
const FileReaderFilter = require('./FileReaderFilter');
const ParserFilter = require('./ParserFilter');
const NormalizationFilter = require('./NormalizacionFilter');
const RequiredFieldsFilter = require('./CamposRequeridosFilter');

// Construye la cadena completa de filtros de ingesta
function crearCadenaIngesta() {

    const extensionFilter = new ExtensionFilter();
    const fileReaderFilter = new FileReaderFilter();
    const parserFilter = new ParserFilter();
    const normalizationFilter = new NormalizationFilter();
    const requiredFieldsFilter = new RequiredFieldsFilter();

    // Se define el orden de ejecución de los filtros
    extensionFilter
        .setNext(fileReaderFilter)
        .setNext(parserFilter)
        .setNext(normalizationFilter)
        .setNext(requiredFieldsFilter);

    return extensionFilter;

}

module.exports = {
    crearCadenaIngesta
};