import React, { Component } from "react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import CustomTooltip from './CustomTooltip';
import classNames from "classnames";
import moment from "moment";
import axios from "axios";
import "./Device.css";

// const loading_spinner = <i className="fas fa-circle-notch fa-spin"/>;
// const base_url = "https://load-forecasting.herokuapp.com/";
const base_url = "http://127.0.0.1:5000/";
const strokeWidth = 2;
const blueColor = "#4285F4";
const greenColor = "#0F9D58";
const mapes = { 13: 5.26, 16: 4.31 };

class Device extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDataLoading: true,
      isModelTraining: false,
      currentLoad: 0,
      nextLoad: 0,
      loadData: [],
      lastUpdated: null,
      mape: 0
    };
  }

  updateData = () => {
    if (this.state.isModelTraining)
      return;

    this.setState({
      ...this.state,
      isDataLoading: true
    });

    const device_id = this.props.match.params.device_id;
    axios.get(base_url + "ml/exec/" + device_id).then(res => {
      let predictedData = res.data.next;
      axios.get(base_url + device_id + "/15").then(res => {
        const currentLoad = parseInt(res.data[0].Load).toFixed(2);

        let loadData = [];

        res.data.forEach(data => {
          loadData.unshift({ Load: parseFloat(data.Load).toFixed(2), predicted: false })
        });
        // predictedData.slice(0, -2).forEach(data => {
        predictedData.forEach(data => {
          loadData.push({ Load: data.toFixed(2), predicted: true })
        });

        const nextLoad = loadData.slice(-1)[0].Load;

        this.setState({
          ...this.state,
          currentLoad,
          loadData,
          nextLoad,
          mape: mapes[device_id],
          isDataLoading: false,
          lastUpdated: Date.now()
        });

        console.log("Data updated.", this.state.loadData);
      });
    });
  };

  trainModel = () => {
    this.setState({
      ...this.state,
      isModelTraining: true
    });

    const device_id = this.props.match.params.device_id;
    axios.get(base_url + "ml/train/" + device_id).then(res => {
      this.setState({
        ...this.state,
        isModelTraining: false
      });
      console.log("Model trained.");
      this.updateData();
    });
  };

  componentDidMount() {
    this.updateData();
    this.interval = setInterval(() => this.updateData(), 10000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const refreshButtonClass = classNames("button", "is-link", "is-large", {
      "is-loading": this.state.isDataLoading
    });

    const trainButtonClass = classNames("button", "is-primary", "is-large", {
      "is-loading": this.state.isDataLoading || this.state.isModelTraining
    });

    const { currentLoad, nextLoad, mape } = this.state;
    return (
      <div className="Device">
        <section className="section">
          <div className="container">
            <div className="columns">
              <div className="column">
                <h1 className="title">
                  Device {this.props.match.params.device_id}
                </h1>
                <p className="subtitle has-text-grey is-italic is-size-6">
                  last updated {moment(this.state.lastUpdated).calendar()}
                </p>
              </div>
              <div className="column has-text-right">
                {/*<button
                  className={trainButtonClass}
                  onClick={this.trainModel}
                  disabled={this.state.isDataLoading || this.state.isModelTraining}
                >
                  <span className="icon">
                    <i className="fas fa-redo-alt"/>
                  </span>
                </button>
                &emsp;*/}
                <button
                  className={trainButtonClass}
                  onClick={this.trainModel}
                  disabled={true}
                >
                  Train
                </button>
                &emsp;
                <button
                  className={refreshButtonClass}
                  onClick={this.updateData}
                  disabled={this.state.isDataLoading}
                >
                  <span className="icon">
                    <i className="fas fa-redo-alt" />
                  </span>
                </button>
              </div>
            </div>
            <div className="has-text-right" />
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="columns is-0">
              <div
                id="current-tile"
                className="column value-tile has-text-centered has-background-info"
              >
                <p className="title is-size-1 has-text-white">{currentLoad}</p>
                <p className="heading">Current</p>
              </div>
              <div
                id="prediction-tile"
                className="column value-tile has-text-centered has-background-success"
              >
                <p className="title is-size-1 has-text-white">{nextLoad}</p>
                <p className="heading">Prediction for next interval</p>
              </div>
              <div
                id="error-tile"
                className="column value-tile has-text-centered has-background-danger"
              >
                <p className="title is-size-1 has-text-white">{mape}%</p>
                <p className="heading">Mean Absolute Percentage Error</p>
              </div>
            </div>
          </div>
        </section>
        <div id="areachart">
          <ResponsiveContainer>
            <AreaChart
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              data={this.state.loadData}
            >
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
                  <stop offset={0.75} stopColor={blueColor} stopOpacity={1} />
                  <stop offset={0.75} stopColor={greenColor} stopOpacity={1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="Load"
                stroke="#888"
                fill="url(#splitColor)"
                strokeWidth={2}
                baseValue="dataMin"
                dot={{ stroke: blueColor, strokeWidth }}
              />
              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}

export default Device;
