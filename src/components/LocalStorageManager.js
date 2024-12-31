import { useEffect } from 'react';

export const useLocalStorage = (setters) => {
    // Load data
    useEffect(() => {
        const savedData = localStorage.getItem('dashboard-data');
        if (savedData && setters) {
            const data = JSON.parse(savedData);
            Object.entries(data).forEach(([key, value]) => {
                setters[`set${key.charAt(0).toUpperCase() + key.slice(1)}`]?.(value);
            });
        }
    }, [setters]); // include setters in dependencies

    // Save data
    useEffect(() => {
        localStorage.setItem('dashboard-data', JSON.stringify({
            tasks: setters.tasks,
            timeBlocks: setters.timeBlocks,
            focusStats: setters.focusStats
        }));
    }, [setters.tasks, setters.timeBlocks, setters.focusStats]);
};

export default useLocalStorage;