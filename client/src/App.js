import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { ethers } from 'ethers'
import { getAccount, getContract } from './utils'

const contract = getContract(true)
const SECRET_KEY = ethers.utils.formatBytes32String('orange')

function App() {
  const [info, setInfo] = useState({})
  const [form, setForm] = useState({})
  const [bids, setBids] = useState([])


  useEffect(() => {
    const initInfo = async() => {
      const beneficiary = await contract.beneficiary()
      const biddingEnd = await contract.biddingEnd()
      const revealEnd = await contract.revealEnd()
      const highestBidder = await contract.highestBidder()
      const highestBid = await contract.highestBid()
      setInfo({...info,
        beneficiary,
        biddingEnd: new Date(biddingEnd * 1000).toString(),
        revealEnd: new Date(revealEnd * 1000).toString(),
        highestBidder,
        highestBid: ethers.utils.formatEther(highestBid.toString())
      })
    }
    initInfo()

    const fetchBids = async() => {
      const account = await getAccount()
      let bidList = []
      let index = 0
      while (true) {
        try {
          const res = await contract.bids(account, index)
          console.log(res)
          bidList.push(res)
          index += 1
        } catch(err) {
          console.log(err)
          break
        }
      }
      setBids(bidList)
    }
    fetchBids()
  }, [])

  const handleChange = (event) => {
    const name = event.target.name
    const value = event.target.value
    setForm({...form, [name]:value})
  }

  const handleBid = async() => {
    const amount = ethers.utils.parseEther(form.amount)
    //const valueBytes = ethers.
    //const value = ethers.utils.keccak256()
    //const value = ethers.utils.solidityPack(
    const value = ethers.utils.solidityKeccak256(
      ["uint", "bool", "bytes32"],
      [amount, false, SECRET_KEY]
    )
    console.log(value)
    const res = await contract.bid(value, {'value':amount})
  }

  const handleReveal = async() => {
    let values = []
    let fakes = []
    let secrets = []
    bids.map(bid => {
      values.push(bid[1])
      fakes.push(false)
      secrets.push(SECRET_KEY)
    })
    console.log(values)
    const res = await contract.reveal(values, fakes, secrets)
  }

  const handleWithdraw = async() => {
    const res = await contract.withdraw()
    console.log(res)
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h2" sx={{my:3}}>
        BlindAuction
      </Typography>
      <Typography>ContractAddress: {contract.address}</Typography>
      <Typography>Beneficiary: {info.beneficiary}</Typography>
      <Typography>BiddingEnd: {info.biddingEnd}</Typography>
      <Typography>RevealEnd: {info.revealEnd}</Typography>
      <Typography>HighestBidder: {info.highestBidder}</Typography>
      <Typography>HighestBid: {info.highestBid}ETH</Typography>

      <Grid container spacing={3} sx={{my:3}}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">My Bidder List</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>BlindedBid</TableCell>
                <TableCell>Deposit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bids.map((bid, index) => (
                <TableRow key={index.toString()}>
                  <TableCell>{bid.blindedBid.substr(0,20)}...</TableCell>
                  <TableCell>{ethers.utils.formatEther(bid.deposit.toString())} ETH</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack sx={{mt:3}} direction="row" spacing={2}>
            <Button variant="contained" onClick={handleReveal}>Reveal</Button>
            <Button variant="outlined" onClick={handleWithdraw}>Withdraw</Button>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <Typography variant="h5">Bid Form</Typography>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              helperText="Uint: ETH"
              onChange={handleChange}
            />
            <Button onClick={handleBid} variant="contained">Bid</Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
