import {JSONSchema7} from "json-schema";


export const COMPLEX_SCHEMA: JSONSchema7 = {
    type: "object",
    title: "User Profile",
    description: "A comprehensive user profile form with multiple sections.",
    properties: {
        personalDetails: {
            type: "object",
            title: "Personal Details",
            properties: {
                firstName: {
                    type: "string",
                    title: "First Name",
                    description: "The user's first name."
                },
                lastName: {
                    type: "string",
                    title: "Last Name",
                    description: "The user's last name."
                },
                dateOfBirth: {
                    type: "string",
                    title: "Date of Birth",
                    format: "date",
                    description: "The user's date of birth."
                },
                gender: {
                    type: "string",
                    title: "Gender",
                    enum: ["Male", "Female", "Other"],
                    description: "The user's gender."
                }
            },
            required: ["firstName", "lastName", "dateOfBirth"]
        },
        contactInfo: {
            type: "object",
            title: "Contact Information",
            properties: {
                email: {
                    type: "string",
                    title: "Email",
                    format: "email",
                    description: "The user's primary email address."
                },
                phoneNumber: {
                    type: "string",
                    title: "Phone Number",
                    pattern: "^[+][0-9]{10,15}$",
                    description: "The user's phone number in international format."
                },
                address: {
                    type: "object",
                    title: "Address",
                    properties: {
                        street: { type: "string", title: "Street" },
                        city: { type: "string", title: "City" },
                        state: { type: "string", title: "State" },
                        postalCode: {
                            type: "string",
                            title: "Postal Code",
                            pattern: "^[0-9]{5}(?:-[0-9]{4})?$",
                            description: "US ZIP code format."
                        }
                    },
                    required: ["street", "city", "postalCode"]
                }
            },
            required: ["email", "phoneNumber", "address"]
        },
        employmentHistory: {
            type: "array",
            title: "Employment History",
            description: "List of the user's previous jobs.",
            items: {
                type: "object",
                properties: {
                    companyName: { type: "string", title: "Company Name" },
                    position: { type: "string", title: "Position" },
                    startDate: {
                        type: "string",
                        title: "Start Date",
                        format: "date"
                    },
                    endDate: {
                        type: "string",
                        title: "End Date",
                        format: "date",
                        description: "Leave blank if currently employed."
                    }
                },
                required: ["companyName", "position", "startDate"]
            }
        },
        education: {
            type: "array",
            title: "Education",
            description: "List of the user's educational qualifications.",
            items: {
                type: "object",
                properties: {
                    institutionName: { type: "string", title: "Institution Name" },
                    degree: {
                        type: "string",
                        title: "Degree",
                        enum: ["High School", "Bachelor's", "Master's", "Ph.D."],
                        description: "The degree obtained."
                    },
                    fieldOfStudy: {
                        type: "string",
                        title: "Field of Study",
                        description: "e.g., Computer Science, Biology"
                    },
                    graduationDate: {
                        type: "string",
                        title: "Graduation Date",
                        format: "date"
                    }
                },
                required: ["institutionName", "degree", "graduationDate"]
            }
        },
        emergencyContact: {
            type: "object",
            title: "Emergency Contact",
            description: "Details of a person to contact in case of emergency.",
            properties: {
                name: { type: "string", title: "Name" },
                relationship: {
                    type: "string",
                    title: "Relationship",
                    enum: ["Parent", "Sibling", "Friend", "Spouse", "Other"]
                },
                phoneNumber: {
                    type: "string",
                    title: "Phone Number",
                    pattern: "^[+][0-9]{10,15}$",
                    description: "Contact's phone number in international format."
                }
            },
            required: ["name", "relationship", "phoneNumber"]
        },
        additionalInfo: {
            type: "object",
            title: "Additional Information",
            properties: {
                hobbies: {
                    type: "array",
                    title: "Hobbies",
                    items: {
                        type: "string",
                        enum: ["Reading", "Traveling", "Sports", "Music", "Gaming", "Cooking"]
                    },
                    description: "Select hobbies that apply."
                },
                bio: {
                    type: "string",
                    title: "Bio",
                    description: "A short bio about the user."
                },
                isAvailableForWork: {
                    type: "boolean",
                    title: "Available for Work",
                    description: "Indicates if the user is open to job offers."
                }
            }
        }
    },
    required: ["personalDetails", "contactInfo", "emergencyContact"]
};

export const REFLECTRIVE_SCHEMA: JSONSchema7  = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Introspection Schema",
    "description": "Schema defining rules for introspecting other JSON formats.",
    "type": "object",
    "properties": {
        "documentTitle": {
            "type": "string",
            "description": "A descriptive name for the document format being introspected."
        },
        "version": {
            "type": "string",
            "description": "Version of the document format."
        },
        "fields": {
            "type": "array",
            "description": "An array of field introspection definitions.",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The field name in the document to introspect."
                    },
                    "path": {
                        "type": "string",
                        "description": "Dot notation path to locate this field in the JSON document."
                    },
                    "type": {
                        "type": "string",
                        "enum": ["string", "number", "boolean", "object", "array"],
                        "description": "Expected data type of the field."
                    },
                    "required": {
                        "type": "boolean",
                        "default": false,
                        "description": "Whether this field is mandatory in the JSON document."
                    },
                    "description": {
                        "type": "string",
                        "description": "Description or purpose of the field."
                    },
                    "schema": {
                        "type": "object",
                        "description": "Nested schema if the field is of type object or array.",
                        "properties": {},
                        "additionalProperties": true
                    }
                },
                "required": ["name", "path", "type"]
            }
        }
    },
    "required": ["documentTitle", "fields"]
}

export const TODO_SCHEMA:JSONSchema7 = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "description": "The title of the todo list"
        },
        "owner": {
            "type": "string",
            "description": "The name of the person who owns the todo list"
        },
        "tasks": {
            "type": "array",
            "description": "An array of tasks in the todo list",
            "items": {
                "type": "object",
                "properties": {
                    "taskName": {
                        "type": "string",
                        "description": "The name of the task"
                    },
                    "completed": {
                        "type": "boolean",
                        "description": "Indicates if the task is completed"
                    },
                    "subtasks": {
                        "type": "array",
                        "description": "An array of subtasks for the task",
                        "items": {
                            "type": "object",
                            "properties": {
                                "subtaskName": {
                                    "type": "string",
                                    "description": "The name of the subtask"
                                },
                                "completed": {
                                    "type": "boolean",
                                    "description": "Indicates if the subtask is completed"
                                }
                            },
                            "required": ["subtaskName", "completed"]
                        }
                    }
                },
                "required": ["taskName", "completed"]
            }
        }
    },
    "required": ["title", "tasks"]
}
