import { BadRequestException, ValidationError } from "@nestjs/common";

function formatErrors(errors: ValidationError[]) {
    const formattedErrors: Record<string, any> = {};

    errors.forEach((err) => {
        if (err.constraints) {
            formattedErrors[err.property] = Object.values(err.constraints);
        }

        if (err.children && err.children.length > 0) {
            formattedErrors[err.property] = formatErrors(err.children);
        }
    });

    return formattedErrors;
}

export function validationExceptionFactory(errors: ValidationError[]) {
    return new BadRequestException({ errors: formatErrors(errors), });
}
