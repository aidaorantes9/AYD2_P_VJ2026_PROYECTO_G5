import { forwardRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

function obtenerDatos(resultado) {
  const certificado = resultado?.certificado || {}
  const datos = certificado.datos || {}

  const integridad =
    resultado?.integridad_certificado || {}

  return {
    codigo:
      certificado.codigo_verificacion ||
      datos.codigo_verificacion ||
      '',

    nombre:
      datos.nombre_candidato ||
      'Candidato certificado',

    competencia:
      datos.competencia ||
      'Competencias Digitales',

    universidad:
      datos.universidad ||
      'No disponible',

    calificacion:
      datos.calificacion ?? null,

    resultado:
      datos.resultado ||
      (resultado?.valido
        ? 'APROBADO'
        : 'NO DISPONIBLE'),

    fecha:
      datos.fecha_emision ||
      certificado.fecha_emision ||
      '',

    hash:
      integridad.hash_almacenado || '',

    firmaValida:
      integridad.firma_valida === true,

    hashValido:
      integridad.hash_valido === true,

    vigente:
      integridad.certificado_vigente === true,
  }
}

function formatearFecha(valor) {
  if (!valor) return 'No disponible'

  const fecha = String(valor)
    .replace('T', ' ')
    .split(' ')[0]

  const partes = fecha.split('-')

  if (partes.length !== 3) {
    return fecha
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

export async function descargarCertificadoPdf(
  elemento,
  codigo
) {
  if (!elemento) {
    throw new Error(
      'No se encontró el certificado para descargar'
    )
  }

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const canvas = await html2canvas(elemento, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  })

  const imagen = canvas.toDataURL('image/png', 1)

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  pdf.addImage(
    imagen,
    'PNG',
    0,
    0,
    297,
    210,
    undefined,
    'FAST'
  )

  pdf.save(`certificado-${codigo}.pdf`)
}

const CertificadoVisual = forwardRef(
  function CertificadoVisual(
    {
      resultado,
    },
    ref
  ) {
    const datos = obtenerDatos(resultado)

    const certificadoValido =
      datos.firmaValida &&
      datos.hashValido &&
      datos.vigente

    return (
      <div
        ref={ref}
        style={{
          width: '1120px',
          height: '792px',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          padding: '38px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#253047',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            border: '3px solid #283341',
            borderRadius: '34px',
            backgroundColor: '#fffef7',
            padding: '55px 75px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: '800',
              textAlign: 'center',
            }}
          >
            PLATAFORMA REGIONAL DE CERTIFICACIÓN
          </div>

          <div
            style={{
              fontSize: '37px',
              fontWeight: '800',
              color: '#5b00e6',
              marginTop: '38px',
              textAlign: 'center',
            }}
          >
            CERTIFICADO DE LOGRO
          </div>

          <div
            style={{
              marginTop: '55px',
              fontSize: '17px',
              color: '#6b7280',
            }}
          >
            Se certifica que
          </div>

          <div
            style={{
              marginTop: '24px',
              fontSize: '34px',
              fontWeight: '800',
              textAlign: 'center',
            }}
          >
            {datos.nombre.toUpperCase()}
          </div>

          <div
            style={{
              marginTop: '52px',
              fontSize: '21px',
              textAlign: 'center',
            }}
          >
            aprobó satisfactoriamente la evaluación de{' '}
            <strong>{datos.competencia}</strong>.
          </div>

          <div
            style={{
              marginTop: '12px',
              fontSize: '17px',
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            {datos.universidad}
          </div>

          <div
            style={{
              width: '100%',
              marginTop: 'auto',
              display: 'grid',
              gridTemplateColumns:
                '1.3fr 1.15fr 0.8fr',
              gap: '42px',
              alignItems: 'end',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                lineHeight: '1.8',
              }}
            >
              <div>
                <strong>Fecha de emisión:</strong>{' '}
                {formatearFecha(datos.fecha)}
              </div>

              <div
                style={{
                  color: '#5b00e6',
                  fontWeight: '700',
                  overflowWrap: 'anywhere',
                }}
              >
                Código de verificación:{' '}
                {datos.codigo}
              </div>

              {datos.calificacion !== null && (
                <div>
                  <strong>Calificación:</strong>{' '}
                  {Number(
                    datos.calificacion
                  ).toFixed(2)}
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: '16px',
              }}
            >
              <div
                style={{
                  marginBottom: '10px',
                  fontWeight: '700',
                }}
              >
                Firma electrónica avanzada
              </div>

              <div
                style={{
                  border: `2px solid ${
                    certificadoValido
                      ? '#159447'
                      : '#dc2626'
                  }`,
                  borderRadius: '7px',
                  padding: '13px 16px',
                  backgroundColor:
                    certificadoValido
                      ? '#dcfce7'
                      : '#fee2e2',
                  color:
                    certificadoValido
                      ? '#15803d'
                      : '#b91c1c',
                  textAlign: 'center',
                  fontWeight: '800',
                }}
              >
                Estado:{' '}
                {certificadoValido
                  ? 'VÁLIDA'
                  : 'NO VÁLIDA'}{' '}
                | PKI SHA-256
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  textAlign: 'right',
                  color: '#6b7280',
                  lineHeight: '1.5',
                }}
              >
                Sello
                <br />
                digital
                <br />
                del SICA
              </div>

              <div
                style={{
                  width: '130px',
                  height: '130px',
                  border: '3px solid #374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: '800',
                  background:
                    'repeating-linear-gradient(45deg, #fff, #fff 8px, #f1f5f9 8px, #f1f5f9 16px)',
                }}
              >
                QR
                <br />
                VERIFICACIÓN
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '28px',
              fontSize: '15px',
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            La autenticidad puede comprobarse mediante el
            código único, la firma electrónica y el rastro
            criptográfico.
          </div>
        </div>
      </div>
    )
  }
)

export default CertificadoVisual
