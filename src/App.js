//import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect} from "react"; 
import { MenuItem, FormControl, Select, Card, CardContent} from "@material-ui/core"
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css"


function App() {
  const [countries,setCountries] = useState([]);
  const [country, setCountry] = useState("worldWide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = 
              useState({ lat: 28.7041, lng: 77.1025});
  const [mapZoom, setMapZoom] = useState(3.5);
  const [mapcountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2,
          }
        ));
        
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
    });
  };
  
  getCountriesData();

  },[]);

  const onCountryChange = async (event) => {

    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = 
          countryCode === "worldWide" 
          ? "https://disease.sh/v3/covid-19/all"
          : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

          await fetch(url)
          .then(response => response.json())
          .then(data => {
            setCountry(countryCode);
            setCountryInfo(data);

            setMapCenter([data.countryInfo.lat,data.countryInfo.long])
            setMapZoom(4);
          })

  };
  return (
    <div className="App">
      <div className="app_left">
            <div className='app_header'>
      <h1>COVID-19 TRACKER</h1>
      <FormControl className="app_dropdown">
        <Select variant="outlined" onChange={onCountryChange} value={country}>
          <MenuItem value = "worldWide">WorldWide</MenuItem>
          {countries.map((country) => (
            <MenuItem value = {country.value}>{country.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      </div>
            

      <div className="app_stats">
        <InfoBox 
        isRed
        active = {casesType === "cases"}
        onClick = {e => setCasesType('cases')}
        title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>

        <InfoBox
        active = {casesType === "recovered"}
        onClick = {e => setCasesType('recovered')}
        title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>

        <InfoBox
        isRed
        active = {casesType === "deaths"}
        onClick = {e => setCasesType('deaths')}
        title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>

      </div>

            <div className="app_map">
              <Map
              casesType={casesType}
              countries = {mapcountries}
              center={mapCenter}
              zoom={mapZoom}
              />
            </div>

      </div>

      <Card className="app_right">
         <CardContent>
            <h3>live Cases by Country</h3>
                <Table countries={tableData} />
            <h3 className="app_graphTitle">WorldWide new {casesType}</h3>
               < LineGraph className="app_graph" casesType={casesType}/>
         </CardContent>
      </Card>
      
          

    </div>
  );
}

export default App;
