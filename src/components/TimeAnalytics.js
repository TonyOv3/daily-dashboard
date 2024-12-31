import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const TimeAnalytics = ({ timeBlocks, focusStats }) => {
    // Process data for charts
    const categoryData = timeBlocks.reduce((acc, block) => {
        acc[block.category] = (acc[block.category] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(categoryData).map(([category, count]) => ({
        category,
        count
    }));

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Time Analytics</h2>
            <BarChart width={500} height={300} data={chartData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Activities per Category" />
            </BarChart>
        </div>
    );
};

export default TimeAnalytics;