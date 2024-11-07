import React, { useState, useEffect } from "react";
import {
    Input,
    Checkbox,
    Select,
    Container,
    SpaceBetween,
    Button,
    DatePicker,
    Multiselect,
    FormField,
    Header,
    ExpandableSection,
    CodeEditor,
    Alert,
    ContentLayout
} from "@cloudscape-design/components";
import { CodeEditorProps } from "@cloudscape-design/components/code-editor";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import ValidatorService from "../service/ValidatorService";
import 'ace-builds/css/ace.css';
import 'ace-builds/css/theme/cloud_editor.css';
import 'ace-builds/css/theme/cloud_editor_dark.css';
import './DynamicForm.css';

interface DynamicFormProps {
    schemaName: string;
    schema: JSONSchema7;
    onSubmit: (data: Record<string, any>) => void;
}

const flattenObject = (data: Record<string, any>, parentKey = '', result: Record<string, any> = {}) => {
    for (let key in data) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof data[key] === 'object' && data[key] !== null) {
            if (Array.isArray(data[key])) {
                (data[key] as Array<Record<string, any>>).forEach((item: Record<string, any>, index: number) => {
                    flattenObject(item, `${fullKey}[${index}]`, result);
                });
            } else {
                flattenObject(data[key], fullKey, result);
            }
        } else {
            result[fullKey] = data[key];
        }
    }
    return result;
};

const unflattenObject = (data: Record<string, any>) => {
    const result: Record<string, any> = {};
    for (let key in data) {
        const keys = key.split(/\.|\[(\d+)\]/g).filter(Boolean);
        keys.reduce((acc, part, index) => {
            const isLast = index === keys.length - 1;
            const isArrayIndex = !isNaN(Number(part));
            const keyOrIndex = isArrayIndex ? Number(part) : part;

            if (isLast) {
                acc[keyOrIndex] = data[key];
            } else {
                acc[keyOrIndex] = acc[keyOrIndex] || (isArrayIndex ? [] : {});
            }
            return acc[keyOrIndex];
        }, result);
    }
    return result;
};

export default function DynamicForm({ schemaName, schema, onSubmit }: DynamicFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>(flattenObject({}));
    const [isJsonView, setIsJsonView] = useState(false);
    const [preferences, setPreferences] = useState<CodeEditorProps.Preferences | undefined>(undefined);
    const [ace, setAce] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAce() {
            try {
                const aceModule = await import("ace-builds/src-noconflict/ace");
                await import("ace-builds/src-noconflict/mode-json");
                await import("ace-builds/src-noconflict/theme-cloud_editor");
                await import("ace-builds/src-noconflict/theme-cloud_editor_dark");
                aceModule.config.set("useStrictCSP", true);
                setAce(aceModule);
            } catch (error) {
                console.error("Error loading Ace editor modules:", error);
            }
        }
        loadAce();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData((prevData) => {
            const updatedData = { ...prevData, [field]: value };
            const unflattenedData = unflattenObject(updatedData);

            const validationError = ValidatorService.validate(schemaName,unflattenedData);
            setError(validationError);

            return updatedData;
        });
    };

    const handleJsonChange = (value: string) => {
        try {
            const parsed = JSON.parse(value);
            setFormData(flattenObject(parsed));
        } catch (error) {
            console.error("Invalid JSON:", error);
        }
    };

    const handleSubmit = () => {
        const nestedData = unflattenObject(formData);
        const validationError = ValidatorService.validate(schemaName, nestedData);
        setError(validationError);

        if (!validationError) {
            onSubmit(nestedData);
        }
    };

    const renderField = (field: string, fieldSchema: JSONSchema7Definition, path: string) => {
        if (!fieldSchema || typeof fieldSchema === "boolean") return null;

        const { type, title, description, enum: enumOptions, format } = fieldSchema;
        const fieldId = path ? `${path}.${field}` : field;

        const renderInput = () => {
            if (enumOptions && Array.isArray(enumOptions)) {
                return (
                    <FormField label={title || field} description={description}>
                        <Select
                            selectedOption={
                                formData[fieldId]
                                    ? { label: formData[fieldId], value: formData[fieldId] }
                                    : { label: "Select...", value: "" }
                            }
                            onChange={({ detail }) => handleChange(fieldId, detail.selectedOption.value)}
                            options={(enumOptions as unknown[]).map((option) => ({
                                label: String(option),
                                value: String(option)
                            }))}
                            placeholder="Select an option"
                        />
                    </FormField>
                );
            } else if (type === "string" && format === "date") {
                return (
                    <FormField label={title || field} description={description}>
                        <DatePicker
                            value={formData[fieldId] || ""}
                            onChange={({ detail }) => handleChange(fieldId, detail.value)}
                            placeholder="YYYY/MM/DD"
                        />
                    </FormField>
                );
            } else if (type === "string") {
                return (
                    <FormField label={title || field} description={description}>
                        <Input
                            value={formData[fieldId] || ""}
                            onChange={({ detail }) => handleChange(fieldId, detail.value)}
                            placeholder={title || field}
                        />
                    </FormField>
                );
            } else if (type === "integer" || type === "number") {
                return (
                    <FormField label={title || field} description={description}>
                        <Input
                            type="number"
                            value={formData[fieldId] || ""}
                            onChange={({ detail }) => handleChange(fieldId, Number(detail.value))}
                            placeholder={title || field}
                        />
                    </FormField>
                );
            } else if (type === "boolean") {
                return (
                    <FormField label={title || field} description={description}>
                        <Checkbox
                            checked={!!formData[fieldId]}
                            onChange={({ detail }) => handleChange(fieldId, detail.checked)}
                        >
                            {title || field}
                        </Checkbox>
                    </FormField>
                );
            } else if (type === "array" && fieldSchema.items && typeof fieldSchema.items === "object") {
                const itemEnum = typeof fieldSchema.items === "object" && "enum" in fieldSchema.items
                    ? (fieldSchema.items as { enum: string[] }).enum
                    : undefined;

                if (itemEnum && Array.isArray(itemEnum)) {
                    return (
                        <FormField label={title || field} description={description}>
                            <Multiselect
                                selectedOptions={(formData[fieldId] || []).map((value: string) => ({
                                    label: value,
                                    value,
                                }))}
                                onChange={({ detail }) =>
                                    handleChange(fieldId, detail.selectedOptions.map((option) => option.value))
                                }
                                options={itemEnum.map((option) => ({
                                    label: String(option),
                                    value: String(option)
                                }))}
                                placeholder="Select hobbies"
                            />
                        </FormField>
                    );
                }

                return (
                    <ExpandableSection
                        headerText={<span className="small-header-text">{title || field}</span>}
                        variant="container"
                    >
                        <SpaceBetween size="s">
                            {(formData[fieldId] || []).map((_: any, index: number) => (
                                <div key={`${fieldId}-${index}`} style={{ display: "flex", alignItems: "center" }}>
                                    <ExpandableSection
                                        headerText={<span className="small-header-text">{`Item ${index + 1}`}</span>}
                                        variant="container"
                                    >
                                        {Object.entries((fieldSchema.items as JSONSchema7).properties || {}).map(
                                            ([subField, subFieldSchema]) =>
                                                renderField(
                                                    subField,
                                                    subFieldSchema as JSONSchema7,
                                                    `${fieldId}[${index}]`
                                                )
                                        )}
                                    </ExpandableSection>
                                    <Button
                                        onClick={() => {
                                            const updatedArray = (formData[fieldId] || []).filter(
                                                (_: any, i: number) => i !== index
                                            );
                                            handleChange(fieldId, updatedArray);
                                        }}
                                        iconName="close"
                                        variant="icon"
                                        ariaLabel="Remove item"
                                    />
                                </div>
                            ))}
                            <Button
                                onClick={() => {
                                    const updatedArray = [...(formData[fieldId] || []), {}];
                                    handleChange(fieldId, updatedArray);
                                }}
                                variant="link"
                            >
                                Add Item
                            </Button>
                        </SpaceBetween>
                    </ExpandableSection>
                );
            } else if (type === "object" && fieldSchema.properties) {
                return (
                    <ExpandableSection
                        headerText={<span className="small-header-text">{title || field}</span>}
                        variant="container"
                    >
                        <SpaceBetween size="m">
                            {Object.entries(fieldSchema.properties).map(([subField, subFieldSchema]) =>
                                renderField(subField, subFieldSchema as JSONSchema7, fieldId)
                            )}
                        </SpaceBetween>
                    </ExpandableSection>
                );
            }
            return null;
        };

        return (
            <div key={fieldId} style={{ marginBottom: '1em' }}>
                {renderInput()}
            </div>
        );
    };

    return (
        <Container
            header={
                <Header
                    actions={
                        <SpaceBetween direction="horizontal" size="s">
                            <Button onClick={handleSubmit} variant="primary">
                                Submit
                            </Button>
                            <Button onClick={() => setIsJsonView(!isJsonView)} variant="normal">
                                {isJsonView ? "Switch to Form View" : "Switch to JSON View"}
                            </Button>
                        </SpaceBetween>
                    }
                >
                    {schemaName}
                </Header>
            }
        >
            {error && (
                <Alert
                    type="error"
                    onDismiss={() => setError(null)}
                >
                    {error}
                </Alert>
            )}
            <ContentLayout>

                    {isJsonView ? (
                        ace ? (
                            <CodeEditor
                                value={JSON.stringify(unflattenObject(formData), null, 2)}
                                onChange={({ detail }) => handleJsonChange(detail.value)}
                                language="json"
                                preferences={preferences}
                                onPreferencesChange={(e) => setPreferences(e.detail)}
                                ace={ace}
                                themes={{
                                    light: ["cloud_editor"],
                                    dark: ["cloud_editor_dark"]
                                }}
                            />
                        ) : (
                            <div>Loading editor...</div>
                        )
                    ) : (
                        <div className="scrollable-content">
                            <SpaceBetween size="l">
                                {Object.entries(schema.properties || {}).map(([field, fieldSchema]) =>
                                    renderField(field, fieldSchema as JSONSchema7, "")
                                )}
                            </SpaceBetween>
                        </div>
                            )}

                        </ContentLayout>
                        </Container>
    );
}
