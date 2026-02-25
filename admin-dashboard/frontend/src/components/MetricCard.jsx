import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function MetricCard({ title, value, icon, color = '#F5A623', trend, trendLabel }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue) || numValue === 0) {
      setDisplayValue(value);
      return;
    }
    let start = 0;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numValue);
      setDisplayValue(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [value]);

  return (
    <Card sx={{
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
    }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          bgcolor: `${color}20`, color,
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{displayValue}</Typography>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend >= 0
                ? <TrendingUpIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
                : <TrendingDownIcon sx={{ fontSize: 16, color: '#E74C3C' }} />}
              <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>
                {trend > 0 ? '+' : ''}{trend}% {trendLabel || ''}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
