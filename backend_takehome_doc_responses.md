# Your Tasks:
1. Fix the tests
	   - I think the test wasn't broken, there was an always false comparison to `campaignTypeTracker` which I removed

   
2. Write a feature that gives out tokens to users.
   - Call this API (`localhost:1938/api/airDrop/create`) with this body
```
	{
		"brandID": "1",
		"numberOfTokens": 10000,
		"effectiveDate": 1859660585112
	}
```
3. Write tests
   - Added to the test infrastructure
