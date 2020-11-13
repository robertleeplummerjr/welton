import { h } from 'preact';
import { useReducer } from 'preact/hooks';
import brain from 'brain.js';

import { Beer } from './beer';
import trainingData from '../assets/training-data.json';
import { getAllInputs, getNetResultsArray } from '../train-utils';
import { W3Slider } from '../w3-slider';
import { formatSliderInput, formatRecipeOutput } from '../formatter';
import trainedNet from '../assets/trained-net.json';
import clawhammerLogo from '../assets/clawhammer logo.png';

const net = new brain.NeuralNetworkGPU();
net.fromJSON(trainedNet);

const qualities = getAllInputs(trainingData);

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
	return (<div id="app">
		<Beer
			style={{
				zIndex: 2,
				width: 500,
				height: 800,
				position: 'fixed',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				top: '50%',
			}}
			red={output.red}
			green={output.green}
			blue={output.blue}
			opacity={1}
		/>
		<div style={{
			position: 'fixed',
			background: 'url(/assets/irish-pub.png) no-repeat center center fixed',
			backgroundSize: 'cover',
			width: typeof window !== 'undefined' ? window.innerWidth : 0,
			height: typeof window !== 'undefined' ? window.innerHeight : 0,
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
										<label for={quality.name}>{quality.name}: {formatSliderInput(quality.name, state[quality.name])}</label>
										<W3Slider
											style={{
												width: '80%',
											}}
											name={quality.name}
											step={0.5}
											value={state[quality.name]}
											min={0}
											max={10}
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
											dispatch({
												type: quality.name,
												value: e.currentTarget.checked ? 1 : 0
											});
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
						if (
							outputType === 'Ale'
							|| outputType === 'Pilsner'
							|| outputType === 'red'
							|| outputType === 'green'
							|| outputType === 'blue'
						) return null;
						if (value < 0.2) return null;
						return (<div>{ outputType } { formatRecipeOutput(outputType, null, value) }</div>);
					})
				}
			</div>
		</div>
		<div style={{
			right: 0,
			top: 0,
			position: 'fixed',
			zIndex: 3,
			padding: '10px',
			width: '160px',
			textAlign: 'center',
		}}>
			<a href="https://www.clawhammersupply.com/" target="_blank" style={{
				textDecoration: 'none',
			}}>
				<div style={{
					color: '#f8f4f2',
				}}>Made with help from:</div>
				<img src={clawhammerLogo} style={{
					width: '120px',
					zIndex: 4,
				}}/>
			</a>
		</div>
	</div>);
}

export default App;
