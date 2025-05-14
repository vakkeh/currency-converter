import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import {
  Container, Typography, Box, TextField, Paper, CircularProgress, Alert, Autocomplete, FormControl, InputLabel, MenuItem, Select, Grid, useMediaQuery
} from '@mui/material';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const getEcbUrl = (currency, start, end) =>
  `https://data-api.ecb.europa.eu/service/data/EXR/D.${currency}.EUR.SP00.A?startPeriod=${start}&endPeriod=${end}&format=csvdata`;

const PERIODS = {
  '30d': { label: '30 dní', days: 30 },
  '1y': { label: '1 rok', days: 365 },
  '5y': { label: '5 let', days: 5 * 365 },
};

const currencyNames = {
  "AED": "UAE Dirham",
  "AFN": "Afghan Afghani",
  "ALL": "Albanian Lek",
  "AMD": "Armenian Dram",
  "ANG": "Netherlands Antillean Guilder",
  "AOA": "Angolan Kwanza",
  "ARS": "Argentine Peso",
  "AUD": "Australian Dollar",
  "AWG": "Aruban Florin",
  "AZN": "Azerbaijani Manat",
  "BAM": "Bosnia-Herzegovina Convertible Mark",
  "BBD": "Barbadian Dollar",
  "BDT": "Bangladeshi Taka",
  "BGN": "Bulgarian Lev",
  "BHD": "Bahraini Dinar",
  "BIF": "Burundian Franc",
  "BMD": "Bermudian Dollar",
  "BND": "Brunei Dollar",
  "BOB": "Bolivian Boliviano",
  "BRL": "Brazilian Real",
  "BSD": "Bahamian Dollar",
  "BTN": "Bhutanese Ngultrum",
  "BWP": "Botswana Pula",
  "BYN": "Belarusian Ruble",
  "BZD": "Belize Dollar",
  "CAD": "Canadian Dollar",
  "CDF": "Congolese Franc",
  "CHF": "Swiss Franc",
  "CLP": "Chilean Peso",
  "CNY": "Chinese Yuan",
  "COP": "Colombian Peso",
  "CRC": "Costa Rican Colón",
  "CUC": "Cuban Convertible Peso",
  "CUP": "Cuban Peso",
  "CVE": "Cape Verdean Escudo",
  "CZK": "Czech Koruna",
  "DJF": "Djiboutian Franc",
  "DKK": "Danish Krone",
  "DOP": "Dominican Peso",
  "DZD": "Algerian Dinar",
  "EGP": "Egyptian Pound",
  "ERN": "Eritrean Nakfa",
  "ETB": "Ethiopian Birr",
  "EUR": "Euro",
  "FJD": "Fijian Dollar",
  "FKP": "Falkland Islands Pound",
  "FOK": "Faroese Króna",
  "GBP": "British Pound Sterling",
  "GEL": "Georgian Lari",
  "GGP": "Guernsey Pound",
  "GHS": "Ghanaian Cedi",
  "GIP": "Gibraltar Pound",
  "GMD": "Gambian Dalasi",
  "GNF": "Guinean Franc",
  "GTQ": "Guatemalan Quetzal",
  "GYD": "Guyanese Dollar",
  "HKD": "Hong Kong Dollar",
  "HNL": "Honduran Lempira",
  "HRK": "Croatian Kuna",
  "HTG": "Haitian Gourde",
  "HUF": "Hungarian Forint",
  "IDR": "Indonesian Rupiah",
  "ILS": "Israeli New Shekel",
  "IMP": "Isle of Man Pound",
  "INR": "Indian Rupee",
  "IQD": "Iraqi Dinar",
  "IRR": "Iranian Rial",
  "ISK": "Icelandic Króna",
  "JMD": "Jamaican Dollar",
  "JOD": "Jordanian Dinar",
  "JPY": "Japanese Yen",
  "KES": "Kenyan Shilling",
  "KGS": "Kyrgyzstani Som",
  "KHR": "Cambodian Riel",
  "KID": "Kiribati Dollar",
  "KMF": "Comorian Franc",
  "KRW": "South Korean Won",
  "KWD": "Kuwaiti Dinar",
  "KYD": "Cayman Islands Dollar",
  "KZT": "Kazakhstani Tenge",
  "LAK": "Lao Kip",
  "LBP": "Lebanese Pound",
  "LKR": "Sri Lankan Rupee",
  "LRD": "Liberian Dollar",
  "LSL": "Lesotho Loti",
  "LYD": "Libyan Dinar",
  "MAD": "Moroccan Dirham",
  "MDL": "Moldovan Leu",
  "MGA": "Malagasy Ariary",
  "MKD": "Macedonian Denar",
  "MMK": "Burmese Kyat",
  "MNT": "Mongolian Tögrög",
  "MOP": "Macanese Pataca",
  "MRU": "Mauritanian Ouguiya",
  "MUR": "Mauritian Rupee",
  "MVR": "Maldivian Rufiyaa",
  "MWK": "Malawian Kwacha",
  "MXN": "Mexican Peso",
  "MYR": "Malaysian Ringgit",
  "MZN": "Mozambican Metical",
  "NAD": "Namibian Dollar",
  "NGN": "Nigerian Naira",
  "NIO": "Nicaraguan Córdoba",
  "NOK": "Norwegian Krone",
  "NPR": "Nepalese Rupee",
  "NZD": "New Zealand Dollar",
  "OMR": "Omani Rial",
  "PAB": "Panamanian Balboa",
  "PEN": "Peruvian Sol",
  "PGK": "Papua New Guinean Kina",
  "PHP": "Philippine Peso",
  "PKR": "Pakistani Rupee",
  "PLN": "Polish Złoty",
  "PYG": "Paraguayan Guaraní",
  "QAR": "Qatari Riyal",
  "RON": "Romanian Leu",
  "RSD": "Serbian Dinar",
  "RUB": "Russian Ruble",
  "RWF": "Rwandan Franc",
  "SAR": "Saudi Riyal",
  "SBD": "Solomon Islands Dollar",
  "SCR": "Seychellois Rupee",
  "SDG": "Sudanese Pound",
  "SEK": "Swedish Krona",
  "SGD": "Singapore Dollar",
  "SHP": "Saint Helena Pound",
  "SLE": "Sierra Leonean Leone",
  "SOS": "Somali Shilling",
  "SRD": "Surinamese Dollar",
  "SSP": "South Sudanese Pound",
  "STN": "São Tomé and Príncipe Dobra",
  "SYP": "Syrian Pound",
  "SZL": "Swazi Lilangeni",
  "THB": "Thai Baht",
  "TJS": "Tajikistani Somoni",
  "TMT": "Turkmenistan Manat",
  "TND": "Tunisian Dinar",
  "TOP": "Tongan Paʻanga",
  "TRY": "Turkish Lira",
  "TTD": "Trinidad and Tobago Dollar",
  "TVD": "Tuvaluan Dollar",
  "TWD": "New Taiwan Dollar",
  "TZS": "Tanzanian Shilling",
  "UAH": "Ukrainian Hryvnia",
  "UGX": "Ugandan Shilling",
  "USD": "United States Dollar",
  "UYU": "Uruguayan Peso",
  "UZS": "Uzbekistani Soʻm",
  "VES": "Venezuelan Bolívar Soberano",
  "VND": "Vietnamese Đồng",
  "VUV": "Vanuatu Vatu",
  "WST": "Samoan Tālā",
  "XAF": "Central African CFA Franc",
  "XCD": "East Caribbean Dollar",
  "XOF": "West African CFA franc",
  "XPF": "CFP Franc",
  "YER": "Yemeni Rial",
  "ZAR": "South African Rand",
  "ZMW": "Zambian Kwacha",
  "ZWL": "Zimbabwean Dollar"
};

const currencyOptions = Object.entries(currencyNames).map(([code, name]) => ({
  code,
  name,
  label: `${code} – ${name}`,
}));

function useEcbHistory(from, to, period) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError('');
    const end = new Date();
    const start = new Date();
    if (period === '30d') start.setDate(end.getDate() - 29);
    if (period === '1y') start.setFullYear(end.getFullYear() - 1);
    if (period === '5y') start.setFullYear(end.getFullYear() - 5);
    const format = d => d.toISOString().slice(0, 10);

    if (from === 'EUR' && to !== 'EUR') {
      fetch(getEcbUrl(to, format(start), format(end)))
        .then(res => res.text())
        .then(csv => {
          const rates = {};
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: results => {
              results.data.forEach(row => {
                rates[row['TIME_PERIOD']] = parseFloat(row['OBS_VALUE']);
              });
              const dates = Object.keys(rates).sort();
              if (dates.length === 0) {
                setError('Pro vybraný pár nejsou historická data.');
                setData(null);
                setLoading(false);
                return;
              }
              setData({
                labels: dates,
                datasets: [{
                  label: `${from} / ${to}`,
                  data: dates.map(date => rates[date]),
                  borderColor: '#1976d2',
                  backgroundColor: '#1976d2',
                  fill: false,
                  tension: 0.2
                }]
              });
              setLoading(false);
            }
          });
        })
        .catch(() => {
          setError('Chyba při načítání historických dat.');
          setLoading(false);
        });
    } else if (to === 'EUR' && from !== 'EUR') {
      fetch(getEcbUrl(from, format(start), format(end)))
        .then(res => res.text())
        .then(csv => {
          const rates = {};
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: results => {
              results.data.forEach(row => {
                rates[row['TIME_PERIOD']] = parseFloat(row['OBS_VALUE']);
              });
              const dates = Object.keys(rates).sort();
              if (dates.length === 0) {
                setError('Pro vybraný pár nejsou historická data.');
                setData(null);
                setLoading(false);
                return;
              }
              setData({
                labels: dates,
                datasets: [{
                  label: `${from} / ${to}`,
                  data: dates.map(date => rates[date] ? 1 / rates[date] : null),
                  borderColor: '#1976d2',
                  backgroundColor: '#1976d2',
                  fill: false,
                  tension: 0.2
                }]
              });
              setLoading(false);
            }
          });
        })
        .catch(() => {
          setError('Chyba při načítání historických dat.');
          setLoading(false);
        });
    } else if (from === 'EUR' && to === 'EUR') {
      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().slice(0, 10));
      }
      setData({
        labels: dates,
        datasets: [{
          label: 'EUR/EUR',
          data: dates.map(() => 1),
          borderColor: '#1976d2',
          backgroundColor: '#1976d2',
          fill: false,
          tension: 0.2
        }]
      });
      setLoading(false);
    } else {
      Promise.all([
        fetch(getEcbUrl(from, format(start), format(end))).then(res => res.text()),
        fetch(getEcbUrl(to, format(start), format(end))).then(res => res.text())
      ]).then(([fromCsv, toCsv]) => {
        const fromRates = {};
        const toRates = {};
        Papa.parse(fromCsv, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            results.data.forEach(row => {
              fromRates[row['TIME_PERIOD']] = parseFloat(row['OBS_VALUE']);
            });
          }
        });
        Papa.parse(toCsv, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            results.data.forEach(row => {
              toRates[row['TIME_PERIOD']] = parseFloat(row['OBS_VALUE']);
            });
          }
        });

        setTimeout(() => {
          const dates = Object.keys(fromRates).filter(date => toRates[date]).sort();
          if (dates.length === 0) {
            setError('Pro vybraný pár nejsou historická data.');
            setData(null);
            setLoading(false);
            return;
          }
          const rates = dates.map(date => fromRates[date] / toRates[date]);
          setData({
            labels: dates,
            datasets: [{
              label: `${from} / ${to}`,
              data: rates,
              borderColor: '#1976d2',
              backgroundColor: '#1976d2',
              fill: false,
              tension: 0.2
            }]
          });
          setLoading(false);
        }, 500);
      }).catch(() => {
        setError('Chyba při načítání historických dat.');
        setLoading(false);
      });
    }
  }, [from, to, period]);

  return { data, loading, error };
}

function useNews(from, to) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newsError, setNewsError] = useState('');

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setNewsError('');
    setNews([]);

    const feeds = [
      `https://www.fxstreet.com/rss/news?c=${from.toLowerCase()}${to.toLowerCase()}`,
      `https://www.fxstreet.com/rss/news?c=${to.toLowerCase()}${from.toLowerCase()}`,
      'https://www.investing.com/rss/news_301.rss',
      'https://www.fxempire.com/news/forex-news/feed',
      'https://www.forexlive.com/feed/news/',
      'https://www.dailyforex.com/forex-rss',
      'https://www.actionforex.com/feed/',
      'https://www.marketpulse.com/feed/',
      'https://www.forexcrunch.com/feed/',
      'https://www.leaprate.com/feed/',
      'https://theforexindex.com/feed/',
      'https://www.earnforex.com/news.xml',
      'https://www.ft.com/?format=rss',
      'http://feeds.reuters.com/reuters/businessNews',
      'https://www.cnbc.com/id/100003114/device/rss/rss.html',
      'https://finance.yahoo.com/news/rssindex',
      'https://www.economist.com/finance-and-economics/rss.xml',
      'https://www.bloomberg.com/feed/podcast/etf-report.xml'
    ];

    Promise.all(
      feeds.map(feed =>
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`)
          .then(res => res.json())
          .then(data => data.items || [])
          .catch(() => [])
      )
    ).then(results => {
      const allNews = [].concat(...results);
      // Filtruj podle výskytu obou měn v titulku nebo popisu
      const filtered = allNews.filter(item => {
        const text = ((item.title || '') + ' ' + (item.description || '')).toUpperCase();
        return text.includes(from.toUpperCase()) && text.includes(to.toUpperCase());
      });
      filtered.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setNews(filtered.slice(0, 20));
      if (filtered.length === 0) {
        setNewsError('Nepodařilo se načíst žádné relevantní novinky pro tento měnový pár.');
      }
      setLoading(false);
    }).catch(() => {
      setNews([]);
      setNewsError('Chyba při načítání novinek.');
      setLoading(false);
    });
  }, [from, to]);

  return { news, loading, newsError };
}


function App() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30d');
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

  // Aktuální kurz z exchangerate-api.com
  useEffect(() => {
    if (!fromCurrency || !toCurrency) return;
    setLoading(true);
    setError('');
    fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates[toCurrency]) {
          setExchangeRate(data.rates[toCurrency]);
        } else {
          setError('Nepodařilo se načíst aktuální kurz.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Chyba při načítání kurzu.');
        setLoading(false);
      });
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (exchangeRate !== null && !isNaN(amount)) {
      setConvertedAmount(amount * exchangeRate);
    } else {
      setConvertedAmount('');
    }
  }, [amount, exchangeRate]);

  const { data: historyData, loading: historyLoading, error: historyError } = useEcbHistory(fromCurrency, toCurrency, period);
  const { news, loading: newsLoading, newsError } = useNews(fromCurrency, toCurrency);


  // Rozložení: pokud jsou novinky a není mobil, posuň převodník a graf doleva a zobraz novinky vpravo
  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 6 }, mb: 4 }}>
      {/* Nadpis */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontSize: { xs: '1.5rem', sm: '2.25rem' }, fontWeight: 700 }}
      >
        Převodník měn
      </Typography>
  
      {/* Hlavní layout: na mobilech sloupec, na větších obrazovkách řádek */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 4 },
          alignItems: 'stretch',
          width: '100%',
        }}
      >
        {/* Levý blok: převodník a graf */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          {/* Převodník */}
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              mb: { xs: 2, sm: 4 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                label="Částka"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                size="small"
                sx={{ flex: 1 }}
                inputProps={{ min: 0 }}
              />
              <TextField
                select
                label="Z měny"
                value={fromCurrency}
                onChange={handleFromCurrencyChange}
                fullWidth
                size="small"
                sx={{ flex: 1 }}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: { xs: 0, sm: 1 },
                }}
              >
                <IconButton
                  aria-label="Prohodit měny"
                  onClick={handleSwapCurrencies}
                  size="large"
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    mx: { xs: 0, sm: 1 },
                  }}
                >
                  <SwapHorizIcon />
                </IconButton>
              </Box>
              <TextField
                select
                label="Do měny"
                value={toCurrency}
                onChange={handleToCurrencyChange}
                fullWidth
                size="small"
                sx={{ flex: 1 }}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
  
            <Typography
              variant="h6"
              align="center"
              sx={{
                mt: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                wordBreak: 'break-word',
              }}
            >
              {amount} {fromCurrency} ={' '}
              <strong>
                {convertedAmount} {toCurrency}
              </strong>
            </Typography>
          </Paper>
  
          {/* Graf */}
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              mb: { xs: 2, sm: 4 },
            }}
          >
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              Vývoj kurzu ({fromCurrency} → {toCurrency})
            </Typography>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { ticks: { font: { size: 10 } } },
                    y: { ticks: { font: { size: 10 } } },
                  },
                }}
                height={isMobile ? 200 : 300}
              />
            </Box>
          </Paper>
        </Box>
  
        {/* Pravý blok: Novinky (na mobilech pod grafem, na desktopu vpravo) */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            mt: { xs: 0, md: 0 },
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              height: '100%',
            }}
          >
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              Novinky ze světa měn
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                p: 0,
                m: 0,
                maxHeight: { xs: 220, sm: 300 },
                overflowY: 'auto',
              }}
            >
              {news.slice(0, isMobile ? 3 : 8).map((item, idx) => (
                <Box
                  key={idx}
                  component="li"
                  sx={{
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid #eee',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    component="a"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      display: 'block',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                  >
                    {item.pubDate}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );  
  
}

export default App;

