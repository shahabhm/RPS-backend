const CITIES = [
    {
        name: 'Tehran',
        persian_name: 'تهران'
    },
    {
        name: 'Shiraz',
        persian_name: 'شیراز'
    },
    {
        name: 'Mashhad',
        persian_name: 'مشهد'
    },
    {
        name: 'Isfahan',
        persian_name: 'اصفهان'
    },
    {
        name: 'Tabriz',
        persian_name: 'تبریز'
    }
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PATIENT_PARAMETERS = [
    {
        name: 'weight',
        persian_name: 'وزن',
        unit: 'kg'
    },
    {
        name: 'blood pressure',
        persian_name: 'فشار خون',
        unit: 'mmHg'
    },
    {
        name: 'temperature',
        persian_name: 'دما',
        unit: 'C'
    },
    {
        name: 'heart rate',
        persian_name: 'ضربان قلب',
        unit: 'bpm'
    },
    {
        name: 'oxygen saturation',
        persian_name: 'اشباع اکسیژن',
        unit: '%'
    },
    {
        name: 'blood sugar',
        persian_name: 'قند خون',
        unit: 'mg/dL'
    },
];

const DOCTORS_SPECIALIZATION = [
    {
        name: "Anesthesiologists",
        persian_name: "بیهوشی"
    },
    {
        name: "Cardiologists",
        persian_name: "قلب و عروق"
    },
    {
        name: "Dermatologists",
        persian_name: "پوست"
    },
    {
        name: "Endocrinologists",
        persian_name: "غدد"
    },
    {
        name: "Gastroenterologists",
        persian_name: "گوارش"
    },
    {
        name: "Hematologists",
        persian_name: "خون"
    },
    {
        name: "Infectious Disease Specialists",
        persian_name: "بیماری‌های عفونی"
    },
    {
        name: "Internists",
        persian_name: "داخلی"
    },
    {
        name: "Medical Geneticists",
        persian_name: "ژنتیک پزشکی"
    },
    {
        name: "Neurologists",
        persian_name: "اعصاب"
    },
    {
        name: "Obstetricians",
        persian_name: "زنان و زایمان"
    },
    {
        name: "Oncologists",
        persian_name: "سرطان"
    },
    {
        name: "Ophthalmologists",
        persian_name: "چشم"
    },
    {
        name: "Osteopaths",
        persian_name: "استخوان"
    },
    {
        name: "Otolaryngologists",
        persian_name: "گوش و حلق و بینی"
    },
    {
        name: "Pathologists",
        persian_name: "پاتولوژی"
    },
    {
        name: "Pediatricians",
        persian_name: "کودکان"
    },
    {
        name: "Physiatrists",
        persian_name: "فیزیاترپی"
    },
    {
        name: "Plastic Surgeons",
        persian_name: "جراحی پلاستیک"
    },
]

module.exports = {CITIES, BLOOD_TYPES, PATIENT_PARAMETERS, DOCTORS_SPECIALIZATION}