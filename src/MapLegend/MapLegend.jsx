import { LegendLinear, LegendItem } from "@visx/legend";

import "./MapLegend.scss";

const legendGlyphSize = 30;

const MapLegend = ({ scale }) => {
  return (
    // <LegendDemo title="Threshold">
    <div className="MapLegend">
      <h3 className="MapLegend__header">Life expectancy</h3>
      <LegendLinear scale={scale}>
        {(labels) => (
          <div className="MapLegend__items">
            {labels.map((label, i) => (
              <LegendItem key={`legend-quantile-${i}`}>
                <svg width={legendGlyphSize} height={legendGlyphSize}>
                  <g>
                    <rect fill={label.value} x={0} y={0} width={legendGlyphSize} height={legendGlyphSize} />
                    <text x="50%" y="50%" className={"MapLegend__label"}>
                      {Math.round(label.text)}
                    </text>
                  </g>
                </svg>
              </LegendItem>
            ))}
          </div>
        )}
      </LegendLinear>
    </div>
  );
};

export default MapLegend;
