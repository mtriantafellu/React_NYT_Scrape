// Include React
var React = require("react");

// Create the Child Component
var Child = React.createClass({

  getInitialState: function() {
    return {
      number: 0
    };
  },
  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Articles</h3>
        </div>
        <div className="panel-body text-center">
            <p>
                Please visit <a href="/articles">/articles</a> to check out the articles list!
            </p>

        </div>
          <h1>{this.state.Article}</h1>

          <div id="articles"></div>
          <div id="notes"></div>
      </div>
    );
  }
});

// Export the component back for use in other files
module.exports = Child;
