import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { trackPromise } from 'react-promise-tracker';

class App extends React.Component {
  //constructor with default values
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoading: false,
      cardData: [],
      searchTerm: '',
      page: 1,
      cardCount: 0,
      render: false
    };
  }

  componentDidMount() {
    //add listener for page scroll
    this.scrollListener = window.addEventListener( 'scroll', e => {
      if ( !this.state.isLoading ) {
        this.handleScroll( e );
      }
    });

    //get cards on page load
    this.cardFetch();
  }

  //function for updating properties when loading more results
  loadMore () {
    this.setState({
      page: this.state.page + 1
    });
    this.cardFetch( this.state.searchTerm );
  }

  //function to get cards
  cardFetch ( keyword = '' ) {
    this.setState({
      isLoading: true
    })
    let page = keyword === this.state.searchTerm ? this.state.page : 1;

    //query api
    trackPromise(
      fetch(`https://api.elderscrollslegends.io/v1/cards?page=${page}&pageSize=20&name=${ keyword }`)
        .then( response => response.json() )
        .then((data) => {
          this.setState({
            cardData: keyword === this.state.searchTerm ? [...this.state.cardData, ...data.cards] : data.cards,
            searchTerm: keyword,
            page: page,
            cardCount: data._totalCount,
            isLoading: false
          });
        })
    )
  }

  //function to set search term
  updateSearchTerm ( e ) {
    this.cardFetch( e.target.value );
  }

  //function for detecting when reaching the bottom of page
  handleScroll = () => { 
    var lastCard = document.querySelector( 'ul.cards > li:last-child' );
    var lastCardOffset = lastCard ? lastCard.offsetTop + lastCard.clientHeight : 0;
    var pageOffset = window.pageYOffset + window.innerHeight;
    if ( pageOffset > lastCardOffset ) {
      //delay loadMore() function
      setTimeout(function() {
        this.loadMore();
        this.setState({render: true, isLoading: true})
      }.bind(this),1000);
    }
  };

  render() {
    let renderedComponent;
    if ( this.state.cardData ) {
      renderedComponent = <div className="card-container">
          <div className="form">
            <label htmlFor="cardSearch">Search for card(s):&nbsp;</label>
            <input
              type="text"
              id="cardSearch"
              className="card-search"
              placeholder="Name or search term..."
              value={this.state.inputValue}
              onChange={e => this.updateSearchTerm(e)}
            />
          </div>

        <ul className="cards row">
          {this.state.cardData.map( ( card ) => {
            return <li card={card.id} key={card.id} className="col-lg-3 col-md-6">
                <div className="card-image">
                <img src={card.imageUrl} alt={card.name + " -- " + card.type} title={card.name + " -- " + card.type} />
                </div>
                <div className="card-info">
                <h3>{card.name}</h3>
                <p>&lt;{card.type}&gt;</p>
                <p className="text">{card.text}</p>
                <p className="set-name">{card.set.id}</p>
                </div>
            </li>;
          })}
        </ul>
      </div>
    }

    return (
      <div>
        {renderedComponent}
      </div>
    )
  }
}

export default App;
