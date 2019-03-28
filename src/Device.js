import React, { Component } from "react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import classNames from "classnames";
import moment from "moment";
import axios from "axios";
import "./Device.css";

const loading_spinner = <i className="fas fa-circle-notch fa-spin" />;
const strokeWidth = 2;
const blueColor = "#4285F4";
const greenColor = "#0F9D58";

class Device extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDataLoading: true,
      currentLoad: 0,
      nextLoad: 0,
      loadData: [],
      predictedData: [],
      lastUpdated: null,
      mape: 0
    };
  }

  updateData = () => {
    this.setState({
      ...this.state,
      isDataLoading: true
    });

    const url = "https://load-forecasting.herokuapp.com/";
    const deviceId = this.props.match.params.device_id;
    axios.get(url + deviceId).then(res => {
      const currentLoad = parseInt(res.data.Load).toFixed(2);
      axios.get(url + "ml/exec/" + deviceId).then(res => {
        var predictedData = res.data.next;
        axios.get(url + deviceId + "/15").then(res => {
          var loadData = res.data;
          loadData.reverse();
          loadData = loadData.map(data => {
            return {
              ...data,
              Load: parseFloat(data.Load).toFixed(2)
            };
          });

          predictedData.unshift(parseFloat(loadData.slice(-1)[0].Load));
          predictedData = predictedData.map(data => {
            return {
              Load: data.toFixed(2)
            };
          });

          const nextLoad = predictedData[1].Load;

          console.log(loadData);
          console.log(predictedData);
          this.setState({
            ...this.state,
            currentLoad,
            predictedData,
            loadData,
            nextLoad,
            mape: 5.31,
            isDataLoading: false,
            lastUpdated: Date.now()
          });

          console.log("Data updated.");
        });
      });
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
    var refreshButtonClass = classNames("button", "is-link", "is-large", {
      "is-loading": this.state.isDataLoading
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
                <button
                  className={refreshButtonClass}
                  onClick={this.updateData}
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
        <div id="currentareachart">
          <ResponsiveContainer>
            <AreaChart
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              data={this.state.loadData}
            >
              <Area
                type="monotone"
                dataKey="Load"
                stroke={blueColor}
                fill={blueColor}
                strokeWidth={2}
                baseValue="dataMin"
                dot={{ stroke: blueColor, strokeWidth }}
              />
              <Tooltip />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div id="predictedareachart">
          <ResponsiveContainer>
            <AreaChart
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              data={this.state.predictedData}
            >
              <Area
                type="monotone"
                stroke={greenColor}
                fill={greenColor}
                dataKey="Load"
                strokeWidth={2}
                baseValue="dataMin"
                dot={{ stroke: greenColor, strokeWidth }}
              />
              <Tooltip />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}

export default Device;
