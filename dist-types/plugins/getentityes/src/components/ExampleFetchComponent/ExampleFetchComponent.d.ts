import React from 'react';
export declare const exampleUsers: {
    results: {
        gender: string;
        name: {
            title: string;
            first: string;
            last: string;
        };
        email: string;
        picture: string;
        nat: string;
    }[];
};
type User = {
    gender: string;
    name: {
        title: string;
        first: string;
        last: string;
    };
    email: string;
    picture: string;
    nat: string;
};
type DenseTableProps = {
    users: User[];
};
export declare const DenseTable: ({ users }: DenseTableProps) => React.JSX.Element;
export declare const ExampleFetchComponent: () => React.JSX.Element;
export {};
