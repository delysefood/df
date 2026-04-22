import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'site_config'
  logo: { type: String }, // URL of the logo image
  hero: {
    title: {
      fr: { type: String },
      en: { type: String },
      es: { type: String },
      it: { type: String },
      ar: { type: String },
      de: { type: String },
      tr: { type: String },
      ru: { type: String }
    },
    description: {
      fr: { type: String },
      en: { type: String },
      es: { type: String },
      it: { type: String },
      ar: { type: String },
      de: { type: String },
      tr: { type: String },
      ru: { type: String }
    }
  },
  footer: {
    description: {
      fr: { type: String },
      en: { type: String },
      es: { type: String },
      it: { type: String },
      ar: { type: String },
      de: { type: String },
      tr: { type: String },
      ru: { type: String }
    },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    socials: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String }
    }
  },
  reservationSettings: {
    requiresPayment: { type: Boolean, default: false },
    feeAmount: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
