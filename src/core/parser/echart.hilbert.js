import hilbert from 'hilbert';

const selectPointsForDownsampling = (
	points,
	hilbertValues,
	threshold = 1000,
) => {
	// Pair each point with its Hilbert value
	const pointsWithHilbert = points.map((point, index) => ({
		point,
		hilbert: hilbertValues[index],
	}));

	// Sort by Hilbert value
	pointsWithHilbert.sort((a, b) => a.hilbert - b.hilbert);

	// Calculate the step size to achieve the target number of points
	const step = Math.ceil(points.length / threshold);

	// Select a subset of points
	const downsampled = [];
	for (let i = 0; i < points.length; i += step) {
		downsampled.push(pointsWithHilbert[i].point);
	}

	return downsampled;
};

const calculateHilbertValue = (point, order = 16) => {
	// Create a Hilbert curve instance
	const hilbertInstance = new hilbert.Hilbert2d(); // Replace with the actual class name if different
	return hilbertInstance.xy2d(point.x, point.y, order);
};

const downsampleSeries = (series, hilbertSettings) => {
	const { order = 16, threshold } = hilbertSettings;

	const downsampledSeries = series.map((data) => {
		const hilbertValues = data.data.map((point) =>
			calculateHilbertValue(point, order),
		);
		const downsampledData = selectPointsForDownsampling(
			data.data,
			hilbertValues,
			threshold,
		);

		return {
			...data,
			data: downsampledData,
		};
	});

	return downsampledSeries;
};

export default downsampleSeries;
