/*
Enums  help to reduce redundancy in the code, as they allow you to define a set of
related constantsin a single place and then reuse them throughout your code.
This makes your code more maintainable, as any changes to the set of allowed values
can be made in one place, rather than scattered throughout your codebase.*/

export enum actionId {
    MESSAGE='message',
    DATE='date',
    INTERVAL='interval',
    FORMAT='format',
    TIME='time',
    REMINDER_SUBMIT='reminder_submit',
    JOB_SUBMIT='job-submit',
    ROOM='room'
}
