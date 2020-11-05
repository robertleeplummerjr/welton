import { h } from 'preact';
import { useEffect, useReducer, useState } from 'preact/hooks';
import brain from 'brain.js';

import { Beer } from './beer';
import trainingData from '../assets/training-data.json';
import { getAllInputs, getAllOutputs, getNetResultsArray } from '../train-utils';
import { W3Slider } from '../w3-slider';
import trainedNet from '../assets/trained-net.json';

const net = new brain.NeuralNetwork();
net.fromJSON(trainedNet);

const qualities = getAllInputs(trainingData);
const results = getAllOutputs(trainingData);

const initialState = {
	'Brew Time': 0,
	'Gravity': 0,
	'ABV': 0,
	'Banana Bread Scent': 0,
	'Clove Scent': 0,
	'Spice Scent': 0,
  'Fruity Scent': 0,
	'Creamy Flavor': 0,
  'Hoppy Flavor': 0,
	'Sweet Flavor': 0,
	'Lime Flavor': 0,
	'Lemon Flavor': 0,
	'Juicy Flavor': 0,
	'Gritty Taste': 0,
	'Dry Taste': 0,
	'Crisp Taste': 0,
	'Light Taste': 0,
};

const reducer = (state, action) => {
	switch (action.type) {
		case 'Brew Time':
		case 'Gravity':
		case 'ABV':

		case 'Banana Bread Scent':
		case 'Clove Scent':
		case 'Spice Scent':
		case 'Fruity Scent':

		case 'Creamy Flavor':
		case 'Hoppy Flavor':
		case 'Sweet Flavor':
		case 'Lime Flavor':
		case 'Lemon Flavor':
		case 'Juicy Flavor':

		case 'Gritty Taste':
		case 'Dry Taste':
		case 'Crisp Taste':
		case 'Light Taste':

		case 'Refreshing Taste':
			return { ...state, [action.type]: action.value };
		default: throw new Error('Unexpected action');
	}
};

export const App = () => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const output = net.run(state);
	const recipe = getNetResultsArray(output);
	useEffect(() => {
		// console.log(getAllOutputs(trainingData));
	});
	return (<div id="app">
		<Beer style={{zIndex: 2}}/>
		<div style={{
			position: 'fixed',
			background: 'url(/assets/irish-pub.png) no-repeat center center fixed',
			backgroundSize: 'cover',
			width: window.innerWidth,
			height: window.innerHeight,
			zIndex: 2,
			fontColor: '#291f1b'
		}}>
			<div style={{ textAlign: 'center', color: '444444', filter: 'drop-shadow(1px 1px 0px goldenrod)' }}>
				<h1 style={{ fontSize: "60px", marginBottom: 0 }}>Welton</h1>
				<h3 style={{ fontSize: "25px", marginTop: 0, paddingLeft: '10px' }}>Experimental Beer Recipe Generator</h3>
			</div>
			<div style={{
				backgroundColor: 'rgba(255,255,255,0.5)',
				width: "30%",
				padding: '50px',
				margin: '50px',
				border: "5px solid white",
				float: 'left',
				color: '#444444'
			}}>
				<h2>Pick your beer style</h2>
				{
					qualities.map(quality => {
						switch (quality.inputType) {
							case 'slider': {
								return (
									<div>
										<label for={quality.name}>{quality.name}: {state[quality.name]}</label>
										<W3Slider name={quality.name} step={1} value={state[quality.name]} min={0} max={10}
															onChange={(value) => {
																value = parseInt(value);
																dispatch({ type: quality.name, value });
															}}/>
									</div>
								);
							}
							case 'checkbox': {
								return (
									<div>
										<input type="checkbox" onChange={(e) => {
											dispatch({ type: quality.name, value: e.currentTarget.checked ? 1 : 0 });
										}} checked={state[quality.name]} />
										<label for={quality.name}>{quality.name}</label>
									</div>
								);
							}
							default:
								throw new Error('unknown quality');
						}
					})
				}
			</div>
			<div style={{
				backgroundColor: 'rgba(255,255,255,0.5)',
				width: "30%",
				padding: '50px',
				margin: '50px',
				border: "5px solid white",
				float: 'right',
				color: '#444444',
				maxHeight: '75%',
				overflow: 'auto',
			}}>
				<h2>Your Experimental { output.Ale > output.Pilsner ? 'Ale' : 'Pilsner' } Recipe</h2>
				{
					recipe.map(({ outputType, value }) => {
						if (outputType === 'Ale' || outputType === 'Pilsner') return null;
						if (value < 0.2) return null;
						return (<div>{ outputType } { value }</div>);
					})
				}
			</div>
		</div>
	</div>);
}

export default App;
