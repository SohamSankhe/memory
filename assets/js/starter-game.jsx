import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root) {
  ReactDOM.render(<Game />, root);
}

// State:
// valueList -> Array of object of type = {buttonValue, isGuessed}
// - Index of array corresponds to the tile number
// - buttonValue is the value of the tile
// - isGuessed is whether the tile has already been guessed correctly
//
// prevGuess -> Index number of the first tile in the guess
//
// currentGuess -> Index number of the second tile in the guess
// - Only needed to keep the tile displayed for a second in case of a bad guess
//
// delay -> flag indicating if delay period is going on
// - Needed to not ignore events in the delay period
//
// score -> +10 for correct guess and -1 for each incorrect guess


class Game extends React.Component {
  	constructor(props) {
		console.log('Constructor called');
    	super(props);
    	
    	var randomAssign = this.generateList();
    	    	
    	this.state = {
			valueList: randomAssign, // {buttonValue: "A-H", isGuessed: boolean}
			prevGuess: -1,
			currentGuess: -1,
	    	delay: false,
	    	score: 0,
		}
		
		this.logState();
	};
	
	// for debugging
	logState()
	{
		this.logList(this.state.valueList);
		console.log("prevGuess - " + this.state.prevGuess);
		console.log("delay - " + this.state.delay);
		console.log("score - " + this.state.score);
	}
	
	// for debugging
	logList(mp)
	{
		console.log("Map: ");
		for(var i = 0; i < 16; i++)
		{
			console.log(i + " - " + mp[i].buttonValue + " - " + mp[i].isGuessed);
		}
	}

	// randomly assign values to buttons from give charset
	generateList()
	{
		console.log("--- gen list called");
		// assigns A-H to 1 to 16
		var newArr = new Array();
		var charSet = "ABCDEFGHABCDEFGH";
		var charList = charSet.split("");
		var lenCounter = charList.length;
		var arrCounter = 0;
		while(lenCounter > 0)
		{
			//var randomIndex = (lenCounter == 1)? 0 : this.getRandomInt(lenCounter);
			var randomIndex = this.getRandomInt(lenCounter);
			newArr[arrCounter] =  {buttonValue: charList.splice(randomIndex,1)[0], isGuessed: false};
			lenCounter = lenCounter - 1;
			arrCounter = arrCounter + 1;
		}
		console.log("arrCounter = " + arrCounter);
		return newArr;
	}

	// random integer generator
	// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	getRandomInt(range)
	{
		return Math.floor(Math.random() * Math.floor(range));
	}

	render() {
		return (
			<div>
				<h1>Memory: Match Tiles</h1>
			
				<div className = "grid">
					<table>
						<tr>
							<td>{this.getButton(0)}</td>
							<td>{this.getButton(1)}</td>
							<td>{this.getButton(2)}</td>
							<td>{this.getButton(3)}</td>
						</tr>
						<tr>
							<td>{this.getButton(4)}</td>
							<td>{this.getButton(5)}</td>
							<td>{this.getButton(6)}</td>
							<td>{this.getButton(7)}</td>
						</tr>
						<tr>
							<td>{this.getButton(8)}</td>
							<td>{this.getButton(9)}</td>
							<td>{this.getButton(10)}</td>
							<td>{this.getButton(11)}</td>
						</tr>
						<tr>
							<td>{this.getButton(12)}</td>
							<td>{this.getButton(13)}</td>
							<td>{this.getButton(14)}</td>
							<td>{this.getButton(15)}</td>
						</tr>
					</table>
				</div>
				<div className = "score">
					<p>Score: {this.state.score}</p>
				</div>
				<div className = "reset">
					<button type="button" className = "restartbutton" onClick={this.clear.bind(this)}>Restart</button>
				</div>
			</div>
		);
  	}
	
	// convenience function for rendering
	getButton(i)
	{
		return (
			<button type= "button" className = "tiles" value={i} onClick={this.onButtonClick.bind(this)}>{this.displayValue(i)}</button>
		);
	}
	
	// to decide if tile value is to be displayed
	displayValue(i)
	{
		if(this.state.prevGuess == i)
		{
			return this.state.valueList[i].buttonValue;
		}
		else if(this.state.currentGuess == i)
		{
			return this.state.valueList[i].buttonValue;
		}
		else if(this.state.valueList[i].isGuessed)
		{
			return this.state.valueList[i].buttonValue;
		}
		else
		{
			return "";
		}
	}

	onButtonClick(ev)
	{
		var ind = ev.target.value;
		
		console.log("Clicked button: " + this.state.valueList[ind].buttonValue);
		
		if(this.state.delay) // ignore events during the delay period
		{
			return null;
		}
		else if(this.state.valueList[ind].isGuessed || this.state.prevGuess == ind || this.state.currentGuess == ind) // already guessed - ignore event
		{
			return null;
		}
		else if(this.state.prevGuess == -1) // first tile - display it
		{
			this.setState(oldState => ({prevGuess: ind}));
		}
		else if(this.state.valueList[this.state.prevGuess].buttonValue == this.state.valueList[ind].buttonValue) // second tile and a match -> mark guessed
		{
			this.setState(oldState => (
				{
					valueList : oldState.valueList.map((item, index) => ((index == ind || index == this.state.prevGuess)? Object.assign({},item, {isGuessed: true}) : item)),
					prevGuess: -1,
					currentGuess: -1,
					score: this.state.score + 10
				}
			));
		}
		else // second tile and a mismatch -> display for a second and hide
		{
			this.setState(oldState => (
				{
					currentGuess: ind,
					delay: true
				}
			));
			
			// Ref for delay: https://stackoverflow.com/questions/42089548/how-to-add-delay-in-reactjs
			setTimeout(function()
				{
					console.log("--- Delayed setState");
					this.setState(oldState => (
						{
							prevGuess: -1,
							currentGuess: -1,
							score: this.state.score - 1,
							delay: false
						}
					));
				}.bind(this), 1000
			);
		}
		
		this.logState();
	}

	// restarts the game - i.e resets the state
	clear()
	{
		this.setState(oldState => (
			{
				valueList: this.generateList(),
				prevGuess: -1,
				currentGuess: -1,
	    		delay: false,
	    		score: 0
			}
		));
		
		this.logState();
	}
}

