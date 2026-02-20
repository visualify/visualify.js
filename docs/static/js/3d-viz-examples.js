// 3D Visualization Examples for Docs
// Loaded externally to avoid docsify external-script plugin issues

// 3D Scatter Example
window.scatter3dExample = {
    type: 'scatter3d',
    title: '3D Scatter Plot Example',
    data: {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [10, 15, 8, 20, 12, 18, 22, 16, 14, 25],
        z: [5, 8, 12, 7, 9, 11, 6, 13, 10, 15]
    },
    xAxis3D: { name: 'X Dimension', type: 'value' },
    yAxis3D: { name: 'Y Dimension', type: 'value' },
    zAxis3D: { name: 'Z Dimension', type: 'value' },
    grid3D: {
        boxWidth: 100,
        boxDepth: 80,
        viewControl: {
            autoRotate: true,
            autoRotateSpeed: 10
        }
    },
    visualMap: {
        dimension: 2,
        max: 25,
        inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8']
        }
    }
};

// 3D Bar Example
window.bar3dExample = {
    type: 'bar3d',
    title: '3D Bar Chart Example',
    data: [
        [0, 0, 10], [0, 1, 20], [0, 2, 15],
        [1, 0, 25], [1, 1, 30], [1, 2, 20],
        [2, 0, 15], [2, 1, 25], [2, 2, 35]
    ],
    xAxis3D: {
        type: 'category',
        data: ['A', 'B', 'C']
    },
    yAxis3D: {
        type: 'category',
        data: ['X', 'Y', 'Z']
    },
    zAxis3D: { type: 'value' },
    grid3D: {
        boxWidth: 200,
        boxDepth: 80,
        light: {
            main: { intensity: 1.2, shadow: true }
        }
    },
    shading: 'lambert'
};

// 3D Surface Example
window.surface3dExample = {
    type: 'surface3d',
    title: '3D Surface Plot Example',
    data: {
        x: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
        y: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
        z: [
            [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0],
            [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
            [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
            [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
            [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
            [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
            [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
            [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
            [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
            [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
            [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0]
        ]
    },
    xAxis3D: { type: 'value' },
    yAxis3D: { type: 'value' },
    zAxis3D: { type: 'value' },
    grid3D: {
        viewControl: { autoRotate: true }
    },
    visualMap: {
        show: true,
        dimension: 2,
        min: 0,
        max: 1.0,
        inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        }
    }
};

window.mountedCharts3D = {
    scatter: false,
    bar: false,
    surface: false
};

window.mount3DCharts = function(retryCount) {
    retryCount = retryCount || 0;
    var maxRetries = 30;
    var retryDelay = 500;
    var isVisualifyReady =
        typeof window.$visualify !== 'undefined' &&
        typeof window.$visualify.Recharts === 'function';

    if (!isVisualifyReady) {
        if (retryCount < maxRetries) {
            setTimeout(function() { window.mount3DCharts(retryCount + 1); }, retryDelay);
        }
        return;
    }

    var scatterEl = document.querySelector('#scatter3d-example');
    var barEl = document.querySelector('#bar3d-example');
    var surfaceEl = document.querySelector('#surface3d-example');

    if (!window.mountedCharts3D.scatter && scatterEl) {
        try {
            new window.$visualify.Recharts(window.scatter3dExample).mount('#scatter3d-example');
            window.mountedCharts3D.scatter = true;
        } catch (e) {
            console.error('[3D Viz] Scatter3D mount error:', e);
        }
    }

    if (!window.mountedCharts3D.bar && barEl) {
        try {
            new window.$visualify.Recharts(window.bar3dExample).mount('#bar3d-example');
            window.mountedCharts3D.bar = true;
        } catch (e) {
            console.error('[3D Viz] Bar3D mount error:', e);
        }
    }

    if (!window.mountedCharts3D.surface && surfaceEl) {
        try {
            new window.$visualify.Recharts(window.surface3dExample).mount('#surface3d-example');
            window.mountedCharts3D.surface = true;
        } catch (e) {
            console.error('[3D Viz] Surface3D mount error:', e);
        }
    }

    if (retryCount < maxRetries &&
        (!window.mountedCharts3D.scatter || !window.mountedCharts3D.bar || !window.mountedCharts3D.surface)
    ) {
        setTimeout(function() { window.mount3DCharts(retryCount + 1); }, retryDelay);
    }
};

window.init3DCharts = function() {
    window.mount3DCharts(0);
};

// Use Docsify's doneEach hook to mount charts after content is rendered
if (typeof window.$docsify !== 'undefined') {
    window.$docsify.plugins = [].concat(window.$docsify.plugins || [], function(hook, vm) {
        hook.doneEach(function() {
            // Reset mounted status when navigating to this page
            window.mountedCharts3D = { scatter: false, bar: false, surface: false };
            // Wait a bit for DOM to be ready
            setTimeout(function() { window.mount3DCharts(0); }, 100);
        });
    });
}

// Also try on DOM ready for initial page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(window.init3DCharts, 500);
    });
} else {
    setTimeout(window.init3DCharts, 500);
}
