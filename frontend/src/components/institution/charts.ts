import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

export { Line, Bar, Doughnut };

export const chartColors = {
  primary: '#146B4A',
  primaryDark: '#0F563B',
  green1: '#4E8D74',
  green2: '#7FB69A',
  green3: '#C4E0D2',
  charcoal: '#1F2933',
  gray: '#9CA3AF',
  line: '#E6EBE8',
};

export const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, boxWidth: 8, padding: 16, color: '#4B5563' },
    },
  },
};