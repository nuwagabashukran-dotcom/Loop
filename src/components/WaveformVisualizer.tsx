import React from 'react';
import * as d3 from 'd3';

interface WaveformVisualizerProps {
  progress?: number;
  height?: number;
  color?: string;
  activeColor?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  progress = 0, 
  height = 80, 
  color = 'rgba(255, 255, 255, 0.1)', 
  activeColor = '#FF2C55' 
}) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const barCount = 100;
    const barWidth = width / barCount - 2;

    // Generate synthetic data
    const data = d3.range(barCount).map(() => Math.random() * height * 0.8 + height * 0.1);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // Create bars
    const bars = svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (_, i) => i * (barWidth + 2))
      .attr('y', d => (height - d) / 2)
      .attr('width', barWidth)
      .attr('height', d => d)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', (_, i) => (i / barCount) * 100 <= progress ? activeColor : color)
      .attr('class', 'transition-all duration-300');

    // Add handle/scrubber line
    svg.append('line')
      .attr('x1', (progress / 100) * width)
      .attr('x2', (progress / 100) * width)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', activeColor)
      .attr('stroke-width', 2)
      .attr('class', 'drop-shadow-[0_0_8px_rgba(255,44,85,0.5)]');

  }, [progress, height, color, activeColor]);

  return (
    <div ref={containerRef} className="w-full h-fit flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 p-4 backdrop-blur-sm">
      <svg ref={svgRef} className="overflow-visible" />
    </div>
  );
};
