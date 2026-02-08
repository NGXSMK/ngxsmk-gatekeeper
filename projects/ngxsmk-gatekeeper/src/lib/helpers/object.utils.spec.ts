import { getValueByPath, setValueByPath } from './object.utils';

describe('Object Utils', () => {
    describe('getValueByPath', () => {
        it('should retrieve a value from a nested object', () => {
            const obj = { user: { profile: { name: 'John' } } };
            expect(getValueByPath(obj, 'user.profile.name')).toBe('John');
        });

        it('should return undefined if path does not exist', () => {
            const obj = { user: { profile: { name: 'John' } } };
            expect(getValueByPath(obj, 'user.profile.age')).toBeUndefined();
        });

        it('should return undefined if intermediate key is not an object', () => {
            const obj = { user: { profile: 'John' } };
            expect(getValueByPath(obj, 'user.profile.name')).toBeUndefined();
        });

        it('should return undefined if object is null', () => {
            expect(getValueByPath(null, 'user.profile.name')).toBeUndefined();
        });

        it('should retrieve value from array index', () => {
            const obj = { users: [{ name: 'John' }, { name: 'Jane' }] };
            expect(getValueByPath(obj, 'users.1.name')).toBe('Jane');
        });
    });

    describe('setValueByPath', () => {
        it('should set a value in a nested object', () => {
            const obj: any = { user: { profile: {} } };
            setValueByPath(obj, 'user.profile.name', 'John');
            expect(obj.user.profile.name).toBe('John');
        });

        it('should create intermediate objects if they do not exist', () => {
            const obj: any = {};
            setValueByPath(obj, 'user.profile.name', 'John');
            expect(obj.user.profile.name).toBe('John');
        });

        it('should overwrite existing value', () => {
            const obj: any = { user: { name: 'John' } };
            setValueByPath(obj, 'user.name', 'Jane');
            expect(obj.user.name).toBe('Jane');
        });

        it('should handle array indices', () => {
            const obj: any = { users: [] };
            setValueByPath(obj, 'users.0', 'John');
            // Note: setValueByPath currently creates objects for missing keys, not arrays.
            // So users.0 will be {'0': 'John'} if users was {} or object.
            // But if users is array, it might assign property '0'.
            // Let's check implementation. 
            // strict check: typeof current[key] !== 'object'. Arrays are objects.
            // So if users is [], current['0'] works.

            expect(obj.users[0]).toBe('John');
        });
    });
});
