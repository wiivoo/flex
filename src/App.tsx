import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import { buildFlexBand } from './model'

function App() {
  // 1 -> 100 cars, 20 -> 2000 cars
  const [carMultiplier, setCarMultiplier] = useState(5)

  const flexBand = useMemo(
    () => buildFlexBand(carMultiplier, 24),
    [carMultiplier],
  )

  const chartData = flexBand.map((p) => ({
    hourLabel: `${p.hour}:00`,
    flexMax: p.flexMaxKW,
  }))

  return (
    <div className="app">
      <header className="app-header">
        <h1>EV Flex Band Viewer</h1>
        <p>
          See how the available charging flexibility of an EV pool grows as you
          increase the number of cars, based on a stylized distribution of
          plug-in times and session durations.
        </p>
      </header>

      <section className="controls">
        <div className="control-group">
          <label>
            Number of cars in the pool
            <input
              type="range"
              min={1}
              max={20}
              value={carMultiplier}
              onChange={(e) => setCarMultiplier(Number(e.target.value))}
            />
            <span>{carMultiplier * 100} cars</span>
          </label>
        </div>
      </section>

      <section className="charts single">
        <div className="chart-card">
          <h3>Flex band over the day</h3>
          <p className="chart-caption">
            Shaded area shows the range of charging power the pool can absorb at
            each time of day, from 0 up to the maximum if all plugged-in cars
            charge at full power.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hourLabel" />
              <YAxis
                label={{ value: 'kW (pool)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="flexMax"
                stroke="#f97316"
                fill="#fed7aa"
                fillOpacity={0.75}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="explanation">
        <h3>How to read this</h3>
        <ul>
          <li>
            The shape comes from an assumed distribution of plug-in times and
            durations (many long overnight sessions starting in the evening).
          </li>
          <li>
            Moving from 100 to 2,000 cars scales the height of the band almost
            linearly: more cars with the same behaviour mean more simultaneous
            charging capacity that an optimizer can use.
          </li>
        </ul>
      </section>
    </div>
  )
}

export default App

