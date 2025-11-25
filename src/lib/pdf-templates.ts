// Templates HTML para geração de PDFs

interface ContractData {
  tenantName: string
  tenantAddress?: string
  tenantPhone?: string
  tenantEmail?: string
  tenantCnpj?: string
  customerName: string
  customerDocument?: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  equipmentName: string
  equipmentDescription?: string
  startDate: string
  endDate: string
  totalPrice: number
  pricePerDay: number
  totalDays: number
  bookingId: string
  createdAt: string
}

interface ReceiptData {
  tenantName: string
  tenantAddress?: string
  tenantPhone?: string
  tenantCnpj?: string
  customerName: string
  customerDocument?: string
  equipmentName: string
  startDate: string
  endDate: string
  totalPrice: number
  bookingId: string
  paymentDate: string
  paymentMethod?: string
}

export const pdfTemplates = {
  // Template de Contrato de Locação
  contract: (data: ContractData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 18pt;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 10pt;
            color: #444;
          }
          .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin: 30px 0;
            text-transform: uppercase;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .parties {
            background: #f5f5f5;
            padding: 15px;
            margin-bottom: 20px;
          }
          .party {
            margin-bottom: 15px;
          }
          .party-title {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .clause {
            margin-bottom: 15px;
            text-align: justify;
          }
          .clause-number {
            font-weight: bold;
          }
          .highlight {
            background: #fffde7;
            padding: 10px;
            border-left: 3px solid #ffc107;
            margin: 15px 0;
          }
          .signatures {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: center;
            width: 45%;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 5px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10pt;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f0f0f0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.tenantName}</h1>
          ${data.tenantAddress ? `<p>${data.tenantAddress}</p>` : ""}
          <p>${[data.tenantPhone, data.tenantEmail].filter(Boolean).join(" | ")}</p>
          ${data.tenantCnpj ? `<p>CNPJ: ${data.tenantCnpj}</p>` : ""}
        </div>

        <div class="title">Contrato de Locação de Equipamentos</div>

        <div class="parties">
          <div class="party">
            <div class="party-title">LOCADOR:</div>
            <p><strong>${data.tenantName}</strong></p>
            ${data.tenantCnpj ? `<p>CNPJ: ${data.tenantCnpj}</p>` : ""}
            ${data.tenantAddress ? `<p>Endereço: ${data.tenantAddress}</p>` : ""}
          </div>
          <div class="party">
            <div class="party-title">LOCATÁRIO:</div>
            <p><strong>${data.customerName}</strong></p>
            ${data.customerDocument ? `<p>CPF/CNPJ: ${data.customerDocument}</p>` : ""}
            ${data.customerAddress ? `<p>Endereço: ${data.customerAddress}</p>` : ""}
            ${data.customerPhone ? `<p>Telefone: ${data.customerPhone}</p>` : ""}
            ${data.customerEmail ? `<p>Email: ${data.customerEmail}</p>` : ""}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Cláusula 1ª - Do Objeto</div>
          <p class="clause">
            O LOCADOR cede ao LOCATÁRIO, em regime de locação, o(s) seguinte(s) equipamento(s):
          </p>
          <table>
            <tr>
              <th>Equipamento</th>
              <th>Período</th>
              <th>Valor/Dia</th>
              <th>Total</th>
            </tr>
            <tr>
              <td>
                <strong>${data.equipmentName}</strong>
                ${data.equipmentDescription ? `<br><small>${data.equipmentDescription}</small>` : ""}
              </td>
              <td>${data.startDate} a ${data.endDate}<br>(${data.totalDays} dias)</td>
              <td>R$ ${data.pricePerDay.toFixed(2)}</td>
              <td><strong>R$ ${data.totalPrice.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Cláusula 2ª - Do Prazo</div>
          <p class="clause">
            A locação terá início em <strong>${data.startDate}</strong> e término em <strong>${data.endDate}</strong>, totalizando <strong>${data.totalDays} dias</strong>.
          </p>
        </div>

        <div class="section">
          <div class="section-title">Cláusula 3ª - Do Valor e Pagamento</div>
          <p class="clause">
            O LOCATÁRIO pagará ao LOCADOR o valor total de <strong>R$ ${data.totalPrice.toFixed(2)}</strong> (${extenso(data.totalPrice)}), referente ao período de locação.
          </p>
        </div>

        <div class="section">
          <div class="section-title">Cláusula 4ª - Das Obrigações do Locatário</div>
          <p class="clause">
            <span class="clause-number">4.1</span> Utilizar o equipamento de acordo com suas especificações técnicas e finalidade;<br>
            <span class="clause-number">4.2</span> Responsabilizar-se pela guarda e conservação do equipamento;<br>
            <span class="clause-number">4.3</span> Devolver o equipamento nas mesmas condições em que o recebeu;<br>
            <span class="clause-number">4.4</span> Comunicar imediatamente ao LOCADOR qualquer avaria ou defeito;<br>
            <span class="clause-number">4.5</span> Não sublocar ou ceder o equipamento a terceiros.
          </p>
        </div>

        <div class="section">
          <div class="section-title">Cláusula 5ª - Das Responsabilidades</div>
          <p class="clause">
            O LOCATÁRIO é responsável por quaisquer danos causados ao equipamento durante o período de locação, exceto pelo desgaste natural de uso, comprometendo-se a ressarcir o LOCADOR pelos prejuízos.
          </p>
        </div>

        <div class="section">
          <div class="section-title">Cláusula 6ª - Do Foro</div>
          <p class="clause">
            As partes elegem o foro da comarca onde se situa o LOCADOR para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato.
          </p>
        </div>

        <div class="highlight">
          <strong>Contrato Nº:</strong> ${data.bookingId.slice(-8).toUpperCase()}<br>
          <strong>Data de Emissão:</strong> ${data.createdAt}
        </div>

        <p style="margin-top: 20px;">
          E por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma.
        </p>

        <div class="signatures">
          <div class="signature">
            <div class="signature-line">
              <strong>${data.tenantName}</strong><br>
              LOCADOR
            </div>
          </div>
          <div class="signature">
            <div class="signature-line">
              <strong>${data.customerName}</strong><br>
              LOCATÁRIO
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Documento gerado eletronicamente em ${data.createdAt}</p>
          <p>Reserva #${data.bookingId.slice(-8).toUpperCase()}</p>
        </div>
      </body>
    </html>
  `,

  // Template de Recibo
  receipt: (data: ReceiptData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            padding: 30px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 30px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 24pt;
            margin-bottom: 5px;
          }
          .header .subtitle {
            font-size: 10pt;
            color: #666;
          }
          .receipt-number {
            text-align: right;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .amount-box {
            background: #f0f0f0;
            border: 1px solid #000;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
          }
          .amount {
            font-size: 24pt;
            font-weight: bold;
            color: #2563eb;
          }
          .details {
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #ccc;
          }
          .detail-label {
            color: #666;
          }
          .detail-value {
            font-weight: bold;
          }
          .text-block {
            margin: 20px 0;
            padding: 15px;
            background: #fafafa;
            border-left: 3px solid #2563eb;
          }
          .signature-area {
            margin-top: 40px;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #000;
            width: 60%;
            margin: 40px auto 5px;
            padding-top: 5px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RECIBO</h1>
            <p class="subtitle">${data.tenantName}</p>
            ${data.tenantAddress ? `<p class="subtitle">${data.tenantAddress}</p>` : ""}
            ${data.tenantCnpj ? `<p class="subtitle">CNPJ: ${data.tenantCnpj}</p>` : ""}
          </div>

          <div class="receipt-number">
            Nº ${data.bookingId.slice(-8).toUpperCase()}
          </div>

          <div class="amount-box">
            <p>Valor Recebido</p>
            <p class="amount">R$ ${data.totalPrice.toFixed(2)}</p>
            <p style="font-size: 10pt; color: #666; margin-top: 5px;">
              (${extenso(data.totalPrice)})
            </p>
          </div>

          <div class="text-block">
            <p>
              Recebi de <strong>${data.customerName}</strong>
              ${data.customerDocument ? ` (CPF/CNPJ: ${data.customerDocument})` : ""}
              a importância de <strong>R$ ${data.totalPrice.toFixed(2)}</strong>
              referente à locação do equipamento <strong>${data.equipmentName}</strong>
              no período de <strong>${data.startDate}</strong> a <strong>${data.endDate}</strong>.
            </p>
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Equipamento:</span>
              <span class="detail-value">${data.equipmentName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Período:</span>
              <span class="detail-value">${data.startDate} a ${data.endDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Data do Pagamento:</span>
              <span class="detail-value">${data.paymentDate}</span>
            </div>
            ${data.paymentMethod ? `
            <div class="detail-row">
              <span class="detail-label">Forma de Pagamento:</span>
              <span class="detail-value">${data.paymentMethod}</span>
            </div>
            ` : ""}
          </div>

          <div class="signature-area">
            <div class="signature-line">
              ${data.tenantName}
            </div>
            <p style="font-size: 9pt; color: #666;">Assinatura do Recebedor</p>
          </div>

          <div class="footer">
            <p>Documento gerado em ${data.paymentDate}</p>
            <p>${data.tenantPhone ? `Tel: ${data.tenantPhone}` : ""}</p>
          </div>
        </div>
      </body>
    </html>
  `,
}

// Função auxiliar para extenso (simplificada)
function extenso(valor: number): string {
  if (valor === 0) return "zero reais"

  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"]
  const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"]
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"]

  const partes = valor.toFixed(2).split(".")
  const reais = parseInt(partes[0])
  const centavos = parseInt(partes[1])

  let resultado = ""

  if (reais > 0) {
    if (reais === 100) {
      resultado = "cem"
    } else if (reais < 10) {
      resultado = unidades[reais]
    } else if (reais < 20) {
      resultado = especiais[reais - 10]
    } else if (reais < 100) {
      const dezena = Math.floor(reais / 10)
      const unidade = reais % 10
      resultado = dezenas[dezena] + (unidade > 0 ? " e " + unidades[unidade] : "")
    } else if (reais < 1000) {
      const centena = Math.floor(reais / 100)
      const resto = reais % 100
      if (resto === 0) {
        resultado = centenas[centena]
      } else if (resto < 10) {
        resultado = centenas[centena] + " e " + unidades[resto]
      } else if (resto < 20) {
        resultado = centenas[centena] + " e " + especiais[resto - 10]
      } else {
        const dezena = Math.floor(resto / 10)
        const unidade = resto % 10
        resultado = centenas[centena] + " e " + dezenas[dezena] + (unidade > 0 ? " e " + unidades[unidade] : "")
      }
    } else {
      resultado = reais.toString()
    }

    resultado += reais === 1 ? " real" : " reais"
  }

  if (centavos > 0) {
    if (reais > 0) resultado += " e "
    if (centavos < 10) {
      resultado += unidades[centavos]
    } else if (centavos < 20) {
      resultado += especiais[centavos - 10]
    } else {
      const dezena = Math.floor(centavos / 10)
      const unidade = centavos % 10
      resultado += dezenas[dezena] + (unidade > 0 ? " e " + unidades[unidade] : "")
    }
    resultado += centavos === 1 ? " centavo" : " centavos"
  }

  return resultado
}
