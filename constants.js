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

const PROVINCES = [{"provinceName":"اردبيل","provinceId":"24"},{"provinceName":"اصفهان","provinceId":"10"},{"provinceName":"البرز","provinceId":"30"},{"provinceName":"ايلام","provinceId":"16"},{"provinceName":"آذربايجان شرقی","provinceId":"03"},{"provinceName":"آذربايجان غربی","provinceId":"04"},{"provinceName":"بوشهر","provinceId":"18"},{"provinceName":"تهران","provinceId":"23"},{"provinceName":"چهارمحال وبختياری","provinceId":"14"},{"provinceName":"خراسان جنوبی","provinceId":"29"},{"provinceName":"خراسان رضوی","provinceId":"09"},{"provinceName":"خراسان شمالی","provinceId":"28"},{"provinceName":"خوزستان","provinceId":"06"},{"provinceName":"زنجان","provinceId":"19"},{"provinceName":"سمنان","provinceId":"20"},{"provinceName":"سيستان وبلوچستان","provinceId":"11"},{"provinceName":"فارس","provinceId":"07"},{"provinceName":"قزوين","provinceId":"26"},{"provinceName":"قم","provinceId":"25"},{"provinceName":"كردستان","provinceId":"12"},{"provinceName":"كرمان","provinceId":"08"},{"provinceName":"كهگيلويه وبويراحمد","provinceId":"17"},{"provinceName":"کرمانشاه","provinceId":"05"},{"provinceName":"گلستان","provinceId":"27"},{"provinceName":"گيلان","provinceId":"01"},{"provinceName":"لرستان","provinceId":"15"},{"provinceName":"مازندران","provinceId":"02"},{"provinceName":"مرکزی","provinceId":"00"},{"provinceName":"هرمزگان","provinceId":"22"},{"provinceName":"همدان","provinceId":"13"},{"provinceName":"يزد","provinceId":"21"}]

const ALL_CITIES = [{"provinceName": "اصفهان","provinceId": "10","cities": [{"cityId": "01","cityName": "اردستان"},{"cityId": "02","cityName": "اصفهان"},{"cityId": "18","cityName": "آران وبيدگل"},{"cityId": "22","cityName": "برخوار"},{"cityId": "24","cityName": "بو يين و مياندشت"},{"cityId": "19","cityName": "تيران وکرون"},{"cityId": "20","cityName": "چادگان"},{"cityId": "03","cityName": "خميني شهر"},{"cityId": "04","cityName": "خوانسار"},{"cityId": "23","cityName": "خور و بيابانک"},{"cityId": "21","cityName": "دهاقان"},{"cityId": "05","cityName": "سميرم"},{"cityId": "16","cityName": "شاهين شهروميمه"},{"cityId": "09","cityName": "شهرضا"},{"cityId": "06","cityName": "فريدن"},{"cityId": "07","cityName": "فريدونشهر"},{"cityId": "08","cityName": "فلاورجان"},{"cityId": "10","cityName": "کاشان"},{"cityId": "11","cityName": "گلپايگان"},{"cityId": "12","cityName": "لنجان"},{"cityId": "17","cityName": "مبارکه"},{"cityId": "13","cityName": "نايين"},{"cityId": "14","cityName": "نجف آباد"},{"cityId": "15","cityName": "نطنز"}]},{"provinceName": "سيستان وبلوچستان","provinceId": "11","cities": [{"cityId": "01","cityName": "ايرانشهر"},{"cityId": "20","cityName": "بمپور"},{"cityId": "21","cityName": "تفتان"},{"cityId": "02","cityName": "چاه بهار"},{"cityId": "03","cityName": "خاش"},{"cityId": "22","cityName": "دشتیاری"},{"cityId": "12","cityName": "دلگان"},{"cityId": "08","cityName": "راسک"},{"cityId": "04","cityName": "زابل"},{"cityId": "05","cityName": "زاهدان"},{"cityId": "10","cityName": "زهک"},{"cityId": "06","cityName": "سراوان"},{"cityId": "23","cityName": "سرباز"},{"cityId": "14","cityName": "سيب و سوران"},{"cityId": "19","cityName": "فنوج"},{"cityId": "18","cityName": "قصرقند"},{"cityId": "09","cityName": "کنارک"},{"cityId": "13","cityName": "مهرستان"},{"cityId": "17","cityName": "ميرجاوه"},{"cityId": "07","cityName": "نيک شهر"},{"cityId": "15","cityName": "نيمروز"},{"cityId": "16","cityName": "هامون"},{"cityId": "11","cityName": "هيرمند"}]},{"provinceName": "كردستان","provinceId": "12","cities": [{"cityId": "01","cityName": "بانه"},{"cityId": "02","cityName": "بيجار"},{"cityId": "10","cityName": "دهگلان"},{"cityId": "07","cityName": "ديواندره"},{"cityId": "09","cityName": "سروآباد"},{"cityId": "03","cityName": "سقز"},{"cityId": "04","cityName": "سنندج"},{"cityId": "05","cityName": "قروه"},{"cityId": "08","cityName": "كامياران"},{"cityId": "06","cityName": "مريوان"}]},{"provinceName": "همدان","provinceId": "13","cities": [{"cityId": "06","cityName": "اسدآباد"},{"cityId": "07","cityName": "بهار"},{"cityId": "01","cityName": "تويسركان"},{"cityId": "10","cityName": "درگزین"},{"cityId": "08","cityName": "رزن"},{"cityId": "09","cityName": "فامنين"},{"cityId": "05","cityName": "كبودرآهنگ"},{"cityId": "02","cityName": "ملاير"},{"cityId": "03","cityName": "نهاوند"},{"cityId": "04","cityName": "همدان"}]},{"provinceName": "چهارمحال وبختياری","provinceId": "14","cities": [{"cityId": "05","cityName": "اردل"},{"cityId": "01","cityName": "بروجن"},{"cityId": "09","cityName": "بن"},{"cityId": "10","cityName": "خانميرزا"},{"cityId": "08","cityName": "سامان"},{"cityId": "02","cityName": "شهرکرد"},{"cityId": "03","cityName": "فارسان"},{"cityId": "06","cityName": "کوهرنگ"},{"cityId": "07","cityName": "کيار"},{"cityId": "04","cityName": "لردگان"}]},{"provinceName": "لرستان","provinceId": "15","cities": [{"cityId": "07","cityName": "ازنا"},{"cityId": "01","cityName": "اليگودرز"},{"cityId": "02","cityName": "بروجرد"},{"cityId": "08","cityName": "پلدختر"},{"cityId": "10","cityName": "چگنی"},{"cityId": "03","cityName": "خرم آباد"},{"cityId": "04","cityName": "دلفان"},{"cityId": "05","cityName": "دورود"},{"cityId": "11","cityName": "رومشکان"},{"cityId": "09","cityName": "سلسله"},{"cityId": "06","cityName": "کوهدشت"}]},{"provinceName": "ايلام","provinceId": "16","cities": [{"cityId": "01","cityName": "ايلام"},{"cityId": "07","cityName": "ايوان"},{"cityId": "06","cityName": "آبدانان"},{"cityId": "10","cityName": "بدره"},{"cityId": "04","cityName": "چرداول"},{"cityId": "02","cityName": "دره شهر"},{"cityId": "03","cityName": "دهلران"},{"cityId": "09","cityName": "سيروان"},{"cityId": "08","cityName": "ملكشاهی"},{"cityId": "05","cityName": "مهران"},{"cityId": "11","cityName": "هلیلان"}]},{"provinceName": "كهگيلويه وبويراحمد","provinceId": "17","cities": [{"cityId": "07","cityName": "باشت"},{"cityId": "05","cityName": "بهمئی"},{"cityId": "01","cityName": "بويراحمد"},{"cityId": "06","cityName": "چرام"},{"cityId": "04","cityName": "دنا"},{"cityId": "02","cityName": "كهگيلويه"},{"cityId": "03","cityName": "گچساران"},{"cityId": "08","cityName": "لنده"},{"cityId": "09","cityName": "مارگون"}]},{"provinceName": "بوشهر","provinceId": "18","cities": [{"cityId": "01","cityName": "بوشهر"},{"cityId": "02","cityName": "تنگستان"},{"cityId": "09","cityName": "جم"},{"cityId": "03","cityName": "دشتستان"},{"cityId": "04","cityName": "دشتی"},{"cityId": "05","cityName": "دير"},{"cityId": "08","cityName": "ديلم"},{"cityId": "10","cityName": "عسلويه"},{"cityId": "06","cityName": "كنگان"},{"cityId": "07","cityName": "گناوه"}]},{"provinceName": "زنجان","provinceId": "19","cities": [{"cityId": "01","cityName": "ابهر"},{"cityId": "06","cityName": "ايجرود"},{"cityId": "03","cityName": "خدابنده"},{"cityId": "07","cityName": "خرمدره"},{"cityId": "04","cityName": "زنجان"},{"cityId": "10","cityName": "سلطانيه"},{"cityId": "08","cityName": "طارم"},{"cityId": "09","cityName": "ماهنشان"}]},{"provinceName": "سمنان","provinceId": "20","cities": [{"cityId": "06","cityName": "آرادان"},{"cityId": "01","cityName": "دامغان"},{"cityId": "08","cityName": "سرخه"},{"cityId": "02","cityName": "سمنان"},{"cityId": "03","cityName": "شاهرود"},{"cityId": "04","cityName": "گرمسار"},{"cityId": "05","cityName": "مهدئ شهر"},{"cityId": "07","cityName": "ميامی"}]},{"provinceName": "يزد","provinceId": "21","cities": [{"cityId": "07","cityName": "ابركوه"},{"cityId": "01","cityName": "اردكان"},{"cityId": "08","cityName": "اشکذر"},{"cityId": "02","cityName": "بافق"},{"cityId": "11","cityName": "بهاباد"},{"cityId": "03","cityName": "تفت"},{"cityId": "09","cityName": "خاتم"},{"cityId": "04","cityName": "مهريز"},{"cityId": "06","cityName": "ميبد"},{"cityId": "05","cityName": "يزد"}]},{"provinceName": "هرمزگان","provinceId": "22","cities": [{"cityId": "01","cityName": "ابوموسی"},{"cityId": "09","cityName": "بستك"},{"cityId": "13","cityName": "بشاگرد"},{"cityId": "02","cityName": "بندرعباس"},{"cityId": "03","cityName": "بندرلنگه"},{"cityId": "11","cityName": "پارسيان"},{"cityId": "06","cityName": "جاسك"},{"cityId": "08","cityName": "حاجي اباد"},{"cityId": "10","cityName": "خمير"},{"cityId": "07","cityName": "رودان"},{"cityId": "12","cityName": "سيريك"},{"cityId": "04","cityName": "قشم"},{"cityId": "05","cityName": "ميناب"}]},{"provinceName": "تهران","provinceId": "23","cities": [{"cityId": "10","cityName": "اسلامشهر"},{"cityId": "19","cityName": "بهارستان"},{"cityId": "13","cityName": "پاكدشت"},{"cityId": "20","cityName": "پرديس"},{"cityId": "18","cityName": "پيشوا"},{"cityId": "01","cityName": "تهران"},{"cityId": "02","cityName": "دماوند"},{"cityId": "12","cityName": "رباط کريم"},{"cityId": "03","cityName": "ری"},{"cityId": "04","cityName": "شميرانات"},{"cityId": "09","cityName": "شهريار"},{"cityId": "14","cityName": "فيروزكوه"},{"cityId": "16","cityName": "قدس"},{"cityId": "21","cityName": "قرچک"},{"cityId": "17","cityName": "ملارد"},{"cityId": "06","cityName": "ورامين"}]},{"provinceName": "اردبيل","provinceId": "24","cities": [{"cityId": "01","cityName": "اردبيل"},{"cityId": "11","cityName": "اصلاندوز"},{"cityId": "02","cityName": "بيله سوار"},{"cityId": "06","cityName": "پارس آباد"},{"cityId": "03","cityName": "خلخال"},{"cityId": "10","cityName": "سرعين"},{"cityId": "07","cityName": "كوثر"},{"cityId": "05","cityName": "گرمی"},{"cityId": "04","cityName": "مشگين شهر"},{"cityId": "08","cityName": "نمين"},{"cityId": "09","cityName": "نير"}]},{"provinceName": "قم","provinceId": "25","cities": [{"cityId": "01","cityName": "قم"}]},{"provinceName": "قزوين","provinceId": "26","cities": [{"cityId": "05","cityName": "البرز"},{"cityId": "04","cityName": "آبيك"},{"cityId": "06","cityName": "آوج"},{"cityId": "01","cityName": "بوئين زهرا"},{"cityId": "02","cityName": "تاكستان"},{"cityId": "03","cityName": "قزوين"}]},{"provinceName": "گلستان","provinceId": "27","cities": [{"cityId": "10","cityName": "آزادشهر"},{"cityId": "08","cityName": "آق قلا"},{"cityId": "01","cityName": "بندرگز"},{"cityId": "02","cityName": "تركمن"},{"cityId": "11","cityName": "راميان"},{"cityId": "03","cityName": "علي آباد کتول"},{"cityId": "04","cityName": "كردكوی"},{"cityId": "09","cityName": "كلاله"},{"cityId": "14","cityName": "گاليكش"},{"cityId": "05","cityName": "گرگان"},{"cityId": "13","cityName": "گميشان"},{"cityId": "06","cityName": "گنبدكاووس"},{"cityId": "12","cityName": "مراوه تپه"},{"cityId": "07","cityName": "مينودشت"}]},{"provinceName": "خراسان شمالی","provinceId": "28","cities": [{"cityId": "01","cityName": "اسفراين"},{"cityId": "02","cityName": "بجنورد"},{"cityId": "03","cityName": "جاجرم"},{"cityId": "08","cityName": "راز و جرگلان"},{"cityId": "04","cityName": "شيروان"},{"cityId": "05","cityName": "فاروج"},{"cityId": "07","cityName": "گرمه"},{"cityId": "06","cityName": "مانه وسملقان"}]},{"provinceName": "خراسان جنوبی","provinceId": "29","cities": [{"cityId": "08","cityName": "بشرويه"},{"cityId": "01","cityName": "بيرجند"},{"cityId": "10","cityName": "خوسف"},{"cityId": "02","cityName": "درميان"},{"cityId": "09","cityName": "زيرکوه"},{"cityId": "06","cityName": "سرايان"},{"cityId": "03","cityName": "سربيشه"},{"cityId": "11","cityName": "طبس"},{"cityId": "07","cityName": "فردوس"},{"cityId": "04","cityName": "قائنات"},{"cityId": "05","cityName": "نهبندان"}]},{"provinceName": "البرز","provinceId": "30","cities": [{"cityId": "05","cityName": "اشتهارد"},{"cityId": "02","cityName": "ساوجبلاغ"},{"cityId": "04","cityName": "طالقان"},{"cityId": "06","cityName": "فرديس"},{"cityId": "01","cityName": "کرج"},{"cityId": "03","cityName": "نظرآباد"}]},{"provinceName": "آذربايجان شرقی","provinceId": "03","cities": [{"cityId": "22","cityName": "اسکو"},{"cityId": "02","cityName": "اهر"},{"cityId": "21","cityName": "آذرشهر"},{"cityId": "13","cityName": "بستان آباد"},{"cityId": "12","cityName": "بناب"},{"cityId": "03","cityName": "تبريز"},{"cityId": "19","cityName": "جلفا"},{"cityId": "23","cityName": "چاراويماق"},{"cityId": "26","cityName": "خداآفرين"},{"cityId": "05","cityName": "سراب"},{"cityId": "14","cityName": "شبستر"},{"cityId": "25","cityName": "عجب شير"},{"cityId": "15","cityName": "کليبر"},{"cityId": "06","cityName": "مراغه"},{"cityId": "07","cityName": "مرند"},{"cityId": "20","cityName": "ملکان"},{"cityId": "10","cityName": "ميانه"},{"cityId": "16","cityName": "هريس"},{"cityId": "11","cityName": "هشترود"},{"cityId": "27","cityName": "هوراند"},{"cityId": "24","cityName": "ورزقان"}]},{"provinceName": "آذربايجان غربی","provinceId": "04","cities": [{"cityId": "01","cityName": "اروميه"},{"cityId": "13","cityName": "اشنويه"},{"cityId": "10","cityName": "بوكان"},{"cityId": "15","cityName": "پلدشت"},{"cityId": "02","cityName": "پيرانشهر"},{"cityId": "12","cityName": "تكاب"},{"cityId": "14","cityName": "چالدران"},{"cityId": "16","cityName": "چايپاره"},{"cityId": "03","cityName": "خوی"},{"cityId": "04","cityName": "سردشت"},{"cityId": "05","cityName": "سلماس"},{"cityId": "11","cityName": "شاهين دژ"},{"cityId": "17","cityName": "شوط"},{"cityId": "06","cityName": "ماكو"},{"cityId": "07","cityName": "مهاباد"},{"cityId": "08","cityName": "مياندوآب"},{"cityId": "09","cityName": "نقده"}]},{"provinceName": "خراسان رضوی","provinceId": "09","cities": [{"cityId": "37","cityName": "باخرز"},{"cityId": "31","cityName": "بجستان"},{"cityId": "23","cityName": "بردسكن"},{"cityId": "32","cityName": "بينالود"},{"cityId": "04","cityName": "تايباد"},{"cityId": "06","cityName": "تربت جام"},{"cityId": "05","cityName": "تربت حيدريه"},{"cityId": "34","cityName": "جغتای"},{"cityId": "36","cityName": "جوين"},{"cityId": "18","cityName": "چناران"},{"cityId": "29","cityName": "خليل آباد"},{"cityId": "19","cityName": "خواف"},{"cityId": "38","cityName": "خوشاب"},{"cityId": "39","cityName": "داورزن"},{"cityId": "07","cityName": "درگز"},{"cityId": "27","cityName": "رشتخوار"},{"cityId": "35","cityName": "زاوه"},{"cityId": "08","cityName": "سبزوار"},{"cityId": "20","cityName": "سرخس"},{"cityId": "40","cityName": "صالح آباد"},{"cityId": "22","cityName": "فريمان"},{"cityId": "33","cityName": "فيروزه"},{"cityId": "13","cityName": "قوچان"},{"cityId": "14","cityName": "كاشمر"},{"cityId": "28","cityName": "كلات"},{"cityId": "41","cityName": "کوهسرخ"},{"cityId": "15","cityName": "گناباد"},{"cityId": "16","cityName": "مشهد"},{"cityId": "30","cityName": "مه ولات"},{"cityId": "17","cityName": "نيشابور"}]},{"provinceName": "خوزستان","provinceId": "06","cities": [{"cityId": "16","cityName": "اميديه"},{"cityId": "21","cityName": "انديکا"},{"cityId": "02","cityName": "انديمشک"},{"cityId": "03","cityName": "اهواز"},{"cityId": "04","cityName": "ايذه"},{"cityId": "01","cityName": "آبادان"},{"cityId": "26","cityName": "آغاجاری"},{"cityId": "15","cityName": "باغ ملک"},{"cityId": "24","cityName": "باوی"},{"cityId": "05","cityName": "بندرماهشهر"},{"cityId": "06","cityName": "بهبهان"},{"cityId": "25","cityName": "حميديه"},{"cityId": "07","cityName": "خرمشهر"},{"cityId": "08","cityName": "دزفول"},{"cityId": "09","cityName": "دشت آزادگان"},{"cityId": "19","cityName": "رامشير"},{"cityId": "10","cityName": "رامهرمز"},{"cityId": "11","cityName": "شادگان"},{"cityId": "14","cityName": "شوش"},{"cityId": "12","cityName": "شوشتر"},{"cityId": "27","cityName": "کارون"},{"cityId": "20","cityName": "گتوند"},{"cityId": "17","cityName": "لالی"},{"cityId": "13","cityName": "مسجدسليمان"},{"cityId": "22","cityName": "هفتکل"},{"cityId": "18","cityName": "هنديجان"},{"cityId": "23","cityName": "هويزه"}]},{"provinceName": "فارس","provinceId": "07","cities": [{"cityId": "17","cityName": "ارسنجان"},{"cityId": "02","cityName": "استهبان"},{"cityId": "03","cityName": "اقليد"},{"cityId": "36","cityName": "اوز"},{"cityId": "01","cityName": "آباده"},{"cityId": "35","cityName": "بختگان"},{"cityId": "16","cityName": "بوانات"},{"cityId": "31","cityName": "بیضا"},{"cityId": "23","cityName": "پاسارگاد"},{"cityId": "04","cityName": "جهرم"},{"cityId": "29","cityName": "خرامه"},{"cityId": "18","cityName": "خرم بيد"},{"cityId": "34","cityName": "خفر"},{"cityId": "24","cityName": "خنج"},{"cityId": "05","cityName": "داراب"},{"cityId": "26","cityName": "رستم"},{"cityId": "30","cityName": "زرقان"},{"cityId": "19","cityName": "زرين دشت"},{"cityId": "06","cityName": "سپيدان"},{"cityId": "32","cityName": "سرچهان"},{"cityId": "25","cityName": "سروستان"},{"cityId": "07","cityName": "شيراز"},{"cityId": "22","cityName": "فراشبند"},{"cityId": "08","cityName": "فسا"},{"cityId": "09","cityName": "فيروزآباد"},{"cityId": "20","cityName": "قيروکارزين"},{"cityId": "10","cityName": "کازرون"},{"cityId": "28","cityName": "کوار"},{"cityId": "33","cityName": "کوه چنار"},{"cityId": "27","cityName": "گراش"},{"cityId": "11","cityName": "لارستان"},{"cityId": "15","cityName": "لامرد"},{"cityId": "12","cityName": "مرودشت"},{"cityId": "13","cityName": "ممسنی"},{"cityId": "21","cityName": "مهر"},{"cityId": "14","cityName": "ني ريز"}]},{"provinceName": "كرمان","provinceId": "08","cities": [{"cityId": "23","cityName": "ارزوئيه"},{"cityId": "20","cityName": "انار"},{"cityId": "01","cityName": "بافت"},{"cityId": "10","cityName": "بردسير"},{"cityId": "02","cityName": "بم"},{"cityId": "03","cityName": "جيرفت"},{"cityId": "18","cityName": "رابر"},{"cityId": "11","cityName": "راور"},{"cityId": "04","cityName": "رفسنجان"},{"cityId": "15","cityName": "رودبارجنوب"},{"cityId": "17","cityName": "ريگان"},{"cityId": "05","cityName": "زرند"},{"cityId": "06","cityName": "سيرجان"},{"cityId": "07","cityName": "شهربابك"},{"cityId": "12","cityName": "عنبرآباد"},{"cityId": "22","cityName": "فارياب"},{"cityId": "19","cityName": "فهرج"},{"cityId": "16","cityName": "قلعه گنج"},{"cityId": "08","cityName": "كرمان"},{"cityId": "09","cityName": "كهنوج"},{"cityId": "14","cityName": "كوهبنان"},{"cityId": "13","cityName": "منوجان"},{"cityId": "21","cityName": "نرماشير"}]},{"provinceName": "کرمانشاه","provinceId": "05","cities": [{"cityId": "01","cityName": "اسلام آبادغرب"},{"cityId": "03","cityName": "پاوه"},{"cityId": "12","cityName": "ثلاث باباجانی"},{"cityId": "09","cityName": "جوانرود"},{"cityId": "13","cityName": "دالاهو"},{"cityId": "14","cityName": "روانسر"},{"cityId": "04","cityName": "سرپل ذهاب"},{"cityId": "05","cityName": "سنقر"},{"cityId": "10","cityName": "صحنه"},{"cityId": "06","cityName": "قصرشيرين"},{"cityId": "02","cityName": "کرمانشاه"},{"cityId": "07","cityName": "کنگاور"},{"cityId": "08","cityName": "گيلانغرب"},{"cityId": "11","cityName": "هرسين"}]},{"provinceName": "گيلان","provinceId": "01","cities": [{"cityId": "13","cityName": "املش"},{"cityId": "01","cityName": "آستارا"},{"cityId": "02","cityName": "آستانه اشرفيه"},{"cityId": "03","cityName": "بندرانزلی"},{"cityId": "05","cityName": "رشت"},{"cityId": "14","cityName": "رضوانشهر"},{"cityId": "06","cityName": "رودبار"},{"cityId": "07","cityName": "رودسر"},{"cityId": "15","cityName": "سياهكل"},{"cityId": "12","cityName": "شفت"},{"cityId": "08","cityName": "صومعه سرا"},{"cityId": "04","cityName": "طوالش"},{"cityId": "09","cityName": "فومن"},{"cityId": "11","cityName": "لاهيجان"},{"cityId": "10","cityName": "لنگرود"},{"cityId": "16","cityName": "ماسال"}]},{"provinceName": "مازندران","provinceId": "02","cities": [{"cityId": "01","cityName": "آمل"},{"cityId": "02","cityName": "بابل"},{"cityId": "16","cityName": "بابلسر"},{"cityId": "04","cityName": "بهشهر"},{"cityId": "05","cityName": "تنكابن"},{"cityId": "21","cityName": "جويبار"},{"cityId": "20","cityName": "چالوس"},{"cityId": "06","cityName": "رامسر"},{"cityId": "07","cityName": "ساری"},{"cityId": "08","cityName": "سوادكوه"},{"cityId": "27","cityName": "سوادکوه شمالی"},{"cityId": "26","cityName": "سيمرغ"},{"cityId": "24","cityName": "عباس آباد"},{"cityId": "23","cityName": "فريدونكنار"},{"cityId": "10","cityName": "قائم شهر"},{"cityId": "28","cityName": "کلاردشت"},{"cityId": "22","cityName": "گلوگاه"},{"cityId": "18","cityName": "محمودآباد"},{"cityId": "25","cityName": "مياندورود"},{"cityId": "19","cityName": "نكا"},{"cityId": "14","cityName": "نور"},{"cityId": "15","cityName": "نوشهر"}]},{"provinceName": "مرکزی","provinceId": "00","cities": [{"cityId": "01","cityName": "اراک"},{"cityId": "02","cityName": "آشتيان"},{"cityId": "03","cityName": "تفرش"},{"cityId": "04","cityName": "خمين"},{"cityId": "12","cityName": "خنداب"},{"cityId": "05","cityName": "دليجان"},{"cityId": "10","cityName": "زرنديه"},{"cityId": "06","cityName": "ساوه"},{"cityId": "07","cityName": "شازند"},{"cityId": "13","cityName": "فراهان"},{"cityId": "11","cityName": "کميجان"},{"cityId": "09","cityName": "محلات"}]}];

module.exports = {ALL_CITIES, PROVINCES, BLOOD_TYPES, PATIENT_PARAMETERS, DOCTORS_SPECIALIZATION}