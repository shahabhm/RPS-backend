const mongoose = require('mongoose');
const {mongo, Schema} = require("mongoose");
mongoose.connect(process.env.MONGO_ADDRESS);

const PatientSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    national_code: String,
    city: String,
    gender: String,
    birthdate: Date,
    weight: Number,
    height: Number,
    blood_type: String,
    condition_description: String,
    condition_history: [String],
    family_history: [String],
    allergies: [String],
    medicines: [String],
    profile_picture: String,
});

const Patient = mongoose.model('Patient', PatientSchema);

const ConditionSchema = new mongoose.Schema({
    name: String,
    persian_name: String
});

const Condition = mongoose.model('Condition', ConditionSchema);

const medicineSchema = new mongoose.Schema({
    name: String,
    persian_name: String
});

const Medicine = mongoose.model('Medicine', medicineSchema);

const allergySchema = new mongoose.Schema({
    name: String,
    persian_name: String
});

const Allergy = mongoose.model('Allergy', allergySchema);

const BriefingSchema = new mongoose.Schema({
    patient_id: String,
    doctor_id: String,
    description: String
});

const Briefing = mongoose.model('Briefing', BriefingSchema);

const ParameterSchema = new mongoose.Schema({
    patient_id: String,
    parameter: String,
    value: Number,
    created_at: Date
});

// patient_id, medicine, dosage, amount, unit, repeat, hours, with_food, notes

const PatientMedicineSchema = new mongoose.Schema({
    medicine: String,
    dosage: String,
    amount: Number,
    unit: String,
    repeat: Number,
    hours: Number,
    with_food: String,
    note: String
});

const PatientMedicine = mongoose.model('PatientMedicine', PatientMedicineSchema);

const Parameter = mongoose.model('Parameter', ParameterSchema);

const PrescriptionSchema = new mongoose.Schema({
    patient_id: String,
    doctor_id: String,
    medicines: [PatientMedicineSchema],
    note: String,
    created_at: Date
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema);

const AddressSchema = new mongoose.Schema({
    address: String,
    latitude: Number,
    longitude: Number
}, {_id: false});

const HospitalSchema = new mongoose.Schema({
    name: String,
    city: String,
    phone_number: String,
    address: AddressSchema,
    image_url: String
});

const Hospital = mongoose.model('Hospital', HospitalSchema);

const ScheduleSchema = new mongoose.Schema({
    day_of_week: String,
    start_hour: Number,
    end_hour: Number
}, {_id: false});

const DoctorSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    national_code: String,
    city: String,
    schedule: [ScheduleSchema],
    address: AddressSchema,
    specialization: String,
    profile_picture: String,
    session_time: Number,
    description: String,
    patients: [PatientSchema],
});

const Doctor = mongoose.model('Doctor', DoctorSchema);

const ReservationSchema = new mongoose.Schema({
    doctor_id: {type: Schema.Types.ObjectId, ref: 'Doctor'},
    patient_id: {type: Schema.Types.ObjectId, ref: 'Patient'},
    date: Date,
    time_slot: String,
    cancelled: Boolean,
    cancellation_reason: String,
});

const Reservation = mongoose.model('Reservation', ReservationSchema);


const AccountSchema = new mongoose.Schema({
    name: String,
    phone_number: String,
    role: String,
    username: String,
    password: String,
    otp: String,
    doctor_id: {type: Schema.Types.ObjectId, ref: 'Doctor'},
    patient_id: {type: Schema.Types.ObjectId, ref: 'Patient'}
})
const Account = mongoose.model('Account', AccountSchema);

const chatSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
});

const Chat = mongoose.model('Chat', chatSchema);

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    text: { type: String },
    seen: {type: Boolean, required: true, default: false},
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    image_name: { type: String }, // if the message is a photo, this will have the name of the image file
    createdAt: { type: Date, default: Date.now }
  });
  
  const Message = mongoose.model('Message', messageSchema);

const deviceSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    code: { type: String, required: true},
});

const Device = mongoose.model('Device', deviceSchema);
module.exports = {
    Account,
    Patient,
    Condition,
    Medicine,
    Allergy,
    Briefing,
    Parameter,
    PatientMedicine,
    Prescription,
    Hospital,
    Doctor,
    Reservation,
    Chat,
    Message,
    Device,
}