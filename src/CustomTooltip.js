import React, {Component} from "react";

class CustomTooltip extends Component {
  render() {
    const {active} = this.props;
    // console.log(this.props);
    if (active && typeof this.props.payload[0] !== 'undefined') {
      const {payload, label} = this.props;
      return (
        <div className="custom-tooltip">
          {/*<p className="label">{`${label} : ${payload[0].value}`}</p>*/}
          <p className="label">{label} : {payload[0].payload.Load}</p>
          <p className="desc">{payload[0].payload.predicted ? "Prediction" : "Actual Data"}</p>
          {/*<p className="intro">{this.getIntroOfPage(label)}</p>*/}
          {/*<p className="desc">Load</p>*/}
        </div>
      );
    } else {
      return null;
    }
  }
};

export default CustomTooltip;