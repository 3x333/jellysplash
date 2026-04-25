export default function Sidebar() {
    return (
        <aside className="app-sidebar">

            <details open>
                <summary>Import Options</summary>
                <div className="section-content">
                    <button type="button" className="import-btn">Upload Files</button>
                    <button type="button" className="import-btn">Sonarr</button>
                    <button type="button" className="import-btn">Radarr</button>
                </div>
            </details>

            <details open>
                <summary>Splashscreen Settings</summary>
                <div className="section-content">

                    <div className="control-group">
                        <label htmlFor="out-size">Output size</label>
                        <select id="out-size" defaultValue="1920x1080">
                            <option value="1920x1080">1920x1080</option>
                            <option value="2560x1440">2560x1440</option>
                            <option value="3840x2160">3840x2160</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="tilt">Tilt angle (°)</label>
                        <input id="tilt" type="range" defaultValue={-15} min={-45} max={45} step={1} />
                    </div>

                    <div className="control-group">
                        <label htmlFor="columns">Columns</label>
                        <input id="columns" type="range" defaultValue={6} min={1} max={30} step={1} />
                    </div>

                    <div className="control-group">
                        <label htmlFor="rows">Rows</label>
                        <input id="rows" type="range" defaultValue={4} min={1} max={20} step={1} />
                    </div>

                    <div className="control-group">
                        <label htmlFor="card-size">Card size (px)</label>
                        <input id="card-size" type="range" defaultValue={200} min={50} max={1000} step={1} />
                    </div>

                    <div className="control-group">
                        <label htmlFor="gap">Gap (px)</label>
                        <input id="gap" type="range" defaultValue={8} min={0} max={100} step={1} />
                    </div>

                    <div className="control-group">
                        <label htmlFor="aspect-ratio">Card aspect ratio</label>
                        <select id="aspect-ratio">
                            <option value="source">Source (auto)</option>
                            <option value="2/3">2:3 — Portrait (posters)</option>
                            <option value="3/2">3:2 — Landscape</option>
                            <option value="4/3">4:3 — Classic</option>
                            <option value="16/9">16:9 — Widescreen</option>
                            <option value="1/1">1:1 — Square</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="corner-radius">Corner radius (px)</label>
                        <input id="corner-radius" type="range" defaultValue={8} min={0} max={100} step={1} />
                    </div>

                    <div className="control-group">
                        <label htmlFor="jitter">Offset jitter (px)</label>
                        <input id="jitter" type="range" defaultValue={0} min={0} max={100} step={1} />
                    </div>

                </div>
            </details>

            <details open>
                <summary>Overlay & Background</summary>
                <div className="section-content">

                    <div className="control-group">
                        <label htmlFor="bg-colour">Background colour</label>
                        <input id="bg-colour" type="color" defaultValue="#000000" />
                    </div>

                    <div className="control-group">
                        <label htmlFor="overlay-type">Overlay type</label>
                        <select id="overlay-type">
                            <option value="none">None</option>
                            <option value="vignette">Vignette</option>
                            <option value="gradient">Gradient</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="overlay-strength">Overlay strength</label>
                        <input id="overlay-strength" type="range" defaultValue={50} min={0} max={100} step={1} />
                    </div>

                    <div className="control-group">
                        <label htmlFor="brightness">Brightness</label>
                        <input id="brightness" type="range" defaultValue={100} min={0} max={200} step={1} />
                    </div>

                    <div className="control-group">
                        <label htmlFor="saturation">Saturation</label>
                        <input id="saturation" type="range" defaultValue={100} min={0} max={200} step={1} />
                    </div>

                </div>
            </details>

        </aside>
    )
}