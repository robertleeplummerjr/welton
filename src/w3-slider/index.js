import { h } from 'preact';

export const W3Slider = (props) => {
  return (
    <div className="slidecontainer">
      <input
        oninput={(e) => {
          props.onChange(e.currentTarget.value);
        }}
        className="slider"
        type="range"
        step={props.step}
        min={props.min}
        max={props.max}
        value={props.value}
      />
  </div>)
};
