


export default class ValidatorService {

    static validate(schemaName:String, data: Record<string, any>): string | null {

        // TODO: delegate to backend service endpoint
        // Example validation logic: Check if a specific field is empty
        if (!data.personalDetails?.firstName) {
            return "First Name is required in Personal Details.";
        }

        // Return null if there are no validation errors
        return null;
    }

}
