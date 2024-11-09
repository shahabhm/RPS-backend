const errors = {
    EMPTY_PASSWORD: {
        error_code: 'EMPTY_PASSWORD',
        error_string: 'رمز عبور خالی است.',
        status_code: 400
    },
    USER_NOT_FOUND: {
        error_code: 'USER_NOT_FOUND',
        error_string: 'نام کاربری یا رمز عبور اشتباه است',
        status_code: 404
    },
    USER_ALREADY_EXISTS: {
        error_code: 'USER_ALREADY_EXISTS',
        error_string: 'کاربر با این نام قبلا ثبت شده است',
        status_code: 400
    },
    TIME_SLOT_NOT_AVAILABLE: {
        error_code: 'TIME_SLOT_NOT_AVAILABLE',
        error_string: 'وقت انتخاب شده پر است',
        status_code: 404
    },
    INVALID_TIME_SLOT: {
        error_code: 'INVALID_TIME_SLOT',
        error_string: 'وقت انتخاب شده معتبر نیست',
        status_code: 400
    },
    INVALID_WORKING_DAY: {
        error_code: 'INVALID_WORKING_DAY',
        error_string: 'دکتر در این روز کار نمی‌کند.',
        status_code: 400
    },
    INVALID_OTP: {
        error_code: 'INVALID_OTP',
        error_string: 'کد اعتبارسنجی اشتباه است.',
        status_code: 400
    }
};

module.exports = errors;