import { HTTPSTATUS, HttpStatusCode } from '../../config/http.config';
import { ErrorCode } from '../enums/error-code.enum';
import { AppError } from './AppError';

export class NotFoundException extends AppError {
    constructor(message = 'Resource not found', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.NOT_FOUND,
            errorCode || ErrorCode.RESOURCE_NOT_FOUND
        );
    }
}

export class BadRequestException extends AppError {
    constructor(message = 'Bad Request', errorCode?: ErrorCode) {
        super(message, HTTPSTATUS.BAD_REQUEST, errorCode);
    }
}

export class UnauthorizedException extends AppError {
    constructor(message = 'Unauthorized Access', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.UNAUTHORIZED,
            errorCode || ErrorCode.ACCESS_UNAUTHORIZED
        );
    }
}

export class InternalServerException extends AppError {
    constructor(message = 'Internal Server Error', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.INTERNAL_SERVER_ERROR,
            errorCode || ErrorCode.INTERNAL_SERVER_ERROR
        );
    }
}

export class HttpException extends AppError {
    constructor(
        message = 'Http Exception Error',
        statusCode: HttpStatusCode,
        errorCode?: ErrorCode
    ) {
        super(message, statusCode, errorCode);
    }
}

// 403 - Forbidden
export class ForbiddenException extends AppError {
    constructor(message = 'Forbidden Access', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.FORBIDDEN,
            errorCode || ErrorCode.ACCESS_FORBIDDEN
        );
    }
}

// 409 - Conflict
export class ConflictException extends AppError {
    constructor(message = 'Conflict Occurred', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.CONFLICT,
            errorCode || ErrorCode.RESOURCE_CONFLICT
        );
    }
}

// 429 - Too Many Requests
export class TooManyRequestsException extends AppError {
    constructor(message = 'Too Many Requests', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.TOO_MANY_REQUESTS,
            errorCode || ErrorCode.TOO_MANY_REQUESTS
        );
    }
}

// 400 - Validation Error (có thể là một biến thể của BadRequest)
export class ValidationException extends AppError {
    constructor(message = 'Validation Failed', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.BAD_REQUEST,
            errorCode || ErrorCode.VALIDATION_ERROR
        );
    }
}

// 502 - Bad Gateway
export class BadGatewayException extends AppError {
    constructor(message = 'Bad Gateway', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.BAD_GATEWAY,
            errorCode || ErrorCode.BAD_GATEWAY
        );
    }
}

// 503 - Service Unavailable
export class ServiceUnavailableException extends AppError {
    constructor(message = 'Service Unavailable', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.SERVICE_UNAVAILABLE,
            errorCode || ErrorCode.SERVICE_UNAVAILABLE
        );
    }
}

// 504 - Gateway Timeout
export class GatewayTimeoutException extends AppError {
    constructor(message = 'Gateway Timeout', errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.GATEWAY_TIMEOUT,
            errorCode || ErrorCode.GATEWAY_TIMEOUT
        );
    }
}
