import React, {useState} from 'react';
import Container from "@cloudscape-design/components/container";
import {COMPLEX_SCHEMA, REFLECTRIVE_SCHEMA, TODO_SCHEMA} from "./Schemas"

import {AppLayout, BreadcrumbGroup,} from '@cloudscape-design/components';
import DynamicForm from "./component/DynamicForm";
import {applyDensity, applyMode, Density, Mode} from '@cloudscape-design/global-styles';

const LOCALE = 'en';

const handleFormSubmit = (data: Record<string, any>) => {
    console.log("Form Data:", data);
};


applyMode(Mode.Dark);
applyDensity(Density.Compact);

export default function App() {
    const [value, setValue] = useState("");

    const schema = COMPLEX_SCHEMA

    return (
        <AppLayout
            breadcrumbs={
                <BreadcrumbGroup
                    items={[
                        { text: 'Home', href: '#' },
                        { text: 'Service', href: '#' },
                    ]}
                />}
            content={
                <Container fitHeight={true}>
                    <div>
                        <h4>prototype of dynamic for based on jsonschema</h4>
                        <DynamicForm schemaName={"test-schema"} schema={schema} onSubmit={handleFormSubmit}/>
                    </div>
                </Container>
            }
        />
    );
}
