import { Resend } from 'resend';
import Settings from '@/models/Settings';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  totalPrice: number;
}

const getFooterHtml = (addr: string, phone: string, email: string) => `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; text-align: center; color: #888; font-size: 12px;">
    <p style="margin: 5px 0;"><strong>Delyse Food - Restaurant Premium</strong></p>
    <p style="margin: 5px 0;">${addr}</p>
    <p style="margin: 5px 0;">Tél: ${phone} | ${email}</p>
    <p style="margin: 5px 0;">Ouvert chaque jour: 11:00 - 00:00</p>
  </div>
`;

const getStyles = () => `
  <style>
    .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .order-table th { text-align: left; border-bottom: 2px solid #C5A059; padding: 10px; color: #C5A059; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; }
    .order-table td { padding: 15px 10px; border-bottom: 1px solid #222; color: #ccc; font-size: 14px; }
    .total-row td { font-weight: bold; color: #C5A059; font-size: 18px; border-top: 2px solid #C5A059; border-bottom: none; }
    .badge { background: #C5A059; color: #000; padding: 5px 10px; border-radius: 4px; font-weight: 800; font-size: 10px; text-transform: uppercase; }
  </style>
`;

export async function sendOrderEmails(data: OrderEmailData) {
  const { orderId, customerName, customerEmail, items, totalPrice } = data;
  const shortOrderId = orderId.slice(-8).toUpperCase();

  // Fetch live settings for the footer info
  const settings = await Settings.findOne({ key: 'site_config' });
  const addr  = settings?.footer?.address || "2 Chem. des Frères Garbero, 06600 Antibes, France";
  const phone = settings?.footer?.phone   || "+33 1 23 45 67 89";
  const email = settings?.footer?.email   || "contact@delysefood.com";
  const logo  = settings?.logo || "https://res.cloudinary.com/dnfuzes76/image/upload/v1713106518/logo_delyse_food_gold.png";

  const itemsHtml = items.map(item => {
    const sauces = item.sauces?.length > 0 ? `<div style="font-size: 11px; color: #888; font-style: italic;">Sauces: ${item.sauces.join(', ')}</div>` : '';
    const extras = item.extras?.length > 0 ? `<div style="font-size: 11px; color: #C5A059; font-weight: bold;">+ ${item.extras.map((e: any) => e.name).join(', ')}</div>` : '';
    
    return `
      <tr>
        <td>
          <div style="font-size: 14px; font-weight: bold; color: #fff;">${item.quantity}x ${item.name}</div>
          ${sauces}
          ${extras}
        </td>
        <td style="text-align: right; vertical-align: top;">${(item.price * item.quantity).toFixed(2)}€</td>
      </tr>
    `;
  }).join('');

  const generateHtml = (title: string, subtitle: string, bodyContent: string) => `
    <!DOCTYPE html>
    <html>
      <head>${getStyles()}</head>
      <body style="background-color: #0c0c0c; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #141414; border: 1px solid #222; border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 40px;">
             <img src="${logo}" width="80" style="margin-bottom: 20px;" alt="Delyse Food Logo" />
             <div style="color: #C5A059; font-size: 24px; font-weight: 900; letter-spacing: -1px;">DELYSE <span style="font-style: italic; font-family: serif; color: #fff;">Food</span></div>
          </div>
          
          <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 10px; text-align: center; color: #ffffff;">${title}</h1>
          <p style="color: #888; text-align: center; margin-bottom: 30px; font-style: italic;">${subtitle}</p>
          
          <div style="background: #000; border-radius: 16px; padding: 20px; border: 1px solid #222; margin-bottom: 30px;">
            <table width="100%">
              <tr>
                <td style="font-size: 10px; color: #555; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Commande #${shortOrderId}</td>
                <td style="text-align: right;"><span class="badge">Paiement Confirmé</span></td>
              </tr>
            </table>
          </div>

          ${bodyContent}

          <table class="order-table">
            <thead>
              <tr>
                <th>Article</th>
                <th style="text-align: right;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td>TOTAL</td>
                <td style="text-align: right;">${totalPrice.toFixed(2)}€</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: #C5A059; color: #ffffff; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; display: inline-block;">Suivre ma commande</a>
          </div>

          ${getFooterHtml(addr, phone, email)}
        </div>
      </body>
    </html>
  `;

  // 1. Email pour le Client
  await resend.emails.send({
    from: 'Delyse Food <onboarding@resend.dev>',
    to: [process.env.RESTAURANT_MANAGER_EMAIL || 'fooddelyse@gmail.com'], 
    subject: `Confirmation de commande #${shortOrderId} - Delyse Food`,
    html: generateHtml(
      "Merci pour votre confiance", 
      `Cher ${customerName}, votre menu est dès à présent en préparation par nos chefs.`,
      `<p style="font-size: 14px; line-height: 1.6; color: #ccc; text-align:center;">Nous préparons votre sélection gastronomique avec le plus grand soin.</p>`
    ),
  });

  // 2. Email pour le Propriétaire
  await resend.emails.send({
    from: 'Système Commandes <onboarding@resend.dev>',
    to: [process.env.RESTAURANT_MANAGER_EMAIL || 'fooddelyse@gmail.com'],
    subject: `🚨 NOUVELLE COMMANDE #${shortOrderId} - ${totalPrice.toFixed(2)}€`,
    html: generateHtml(
      "Nouvelle Commande !", 
      `Une commande vient d'être réglée par ${customerName}.`,
      `<div style="background: #C5A059; color: #000; padding: 20px; border-radius: 12px; font-weight: bold; margin-bottom: 20px; text-align: center;">
        Veuillez lancer la préparation immédiatement.
       </div>`
    ),
  });
}
