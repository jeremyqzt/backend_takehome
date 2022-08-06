import { addModelToInternalDB, getModelFromInternalDB } from "../db/internalDB.js";
import { runHooks } from "../routes/hooks/crudHooks.js";
import _ from "lodash";

describe("air drop -- hooks", () => {
    it("getPost hook should return the distribute the tokens to all users", async () => {
        const BRAND_ID = `brandID1`;
        const ELIGIBLE_USERS = 4;
        const TOTAL = 10000;
        const TOKEN_PER = TOTAL / ELIGIBLE_USERS;
        const INITIAL_BALANCE = 1;

        // add the brand first so that we set also test that the brandID on the campaign
        addModelToInternalDB(`brand`, { id: BRAND_ID, userID: "U1" });

        // Users
        addModelToInternalDB(`userAccount`, { id: "U1" });
        addModelToInternalDB(`userAccount`, { id: "U2" });

        // User, eligible for drop, with tokens already
        addModelToInternalDB(`userAccount`, {
            id: "U3", tokens: [
                {
                    "brandID": BRAND_ID,
                    "balance": INITIAL_BALANCE,
                }
            ]
        });
        // User, eligible for drop, with other tokens
        const lastInsert = addModelToInternalDB(`userAccount`, {
            id: "U4", tokens: [
                {
                    "brandID": `not-${BRAND_ID}`,
                    "balance": 1,
                    "lastUpdated": "August 05 2022"
                }
            ]
        });

        const createAirDropRequest = {
            "brandID": BRAND_ID,
            "numberOfTokens": 10000,
            "effectiveDate": lastInsert.createdAt,
        };

        // The actual drop
        addModelToInternalDB(`airDrop`, createAirDropRequest);

        // hook to distribute 
        const airDropFromDB = await runHooks(`createPost`, `airDrop`, createAirDropRequest, {});

        // User, created after drop effective time
        addModelToInternalDB(`userAccount`, { id: "U5" });

        expect(airDropFromDB.brandID).toBe(BRAND_ID);
        expect(airDropFromDB.eligibleUsers).toBe(ELIGIBLE_USERS);
        expect(airDropFromDB.tokenPerUser).toBe(TOKEN_PER);

        // Tokens dropped correctly
        const eligible1 = getModelFromInternalDB('userAccount', { id: "U1" });
        expect(eligible1.tokens[0].balance).toBe(TOKEN_PER);

        const eligible2 = getModelFromInternalDB('userAccount', { id: "U2" });
        expect(eligible2.tokens[0].balance).toBe(TOKEN_PER);

        const eligible3 = getModelFromInternalDB('userAccount', { id: "U3" });
        expect(eligible3.tokens[0].balance).toBe(TOKEN_PER + INITIAL_BALANCE);

        const eligible4 = getModelFromInternalDB('userAccount', { id: "U4" });
        expect(eligible4.tokens.length > 1).toBe(true);
        expect(eligible4.tokens.some((tok) => tok.brandID === BRAND_ID && tok.balance === TOKEN_PER)).toBe(true);

        const ineligible5 = getModelFromInternalDB('userAccount', { id: "U5" });
        expect(ineligible5.tokens).toBeFalsy();

    });
});
