import {
    addModelToInternalDB,
    getModelFromInternalDB,
    listModelsFromInternalDB,
    modelExistsInInternalDB,
    upsertModelInInternalDB,
} from "../db/internalDB.js";
import { validatePropertiesOnObject } from "../utils/validations.js";
import _ from "lodash";
import { getTokenAwardDate, getTokenPerUser } from '../business/airDropCalculations.js';

const REQUIRED_FIELD_FOR_AIRDROP = ['brandID', 'numberOfTokens', 'effectiveDate'];
const AIR_DROP = 'airDrop';
const NON_CREATE_ERROR = "Only create is allowed, cannot upsert or update an already distributed air drop."

export const hooks = {

    upsert: () => {
        throw NON_CREATE_ERROR;
    },

    update: () => {
        throw NON_CREATE_ERROR;
    },

    createPost: (airDropModel, __) => {
        const inputValid = validatePropertiesOnObject(airDropModel, REQUIRED_FIELD_FOR_AIRDROP);

        if (!inputValid) {
            throw `airDropModel requires the following fields ${REQUIRED_FIELD_FOR_AIRDROP.toString()} the input was this: ${JSON.stringify(
                airDropModel
            )}`;
        }

        // Find brand genereous enough to provide air drop, can assume they exist
        const brand = getModelFromInternalDB('brand', { id: airDropModel.brandID });

        // Time eligible means the user had an account at time of drop
        const allTimeEligibleUsers = listModelsFromInternalDB('userAccount', (user) => {
            {
                return user.createdAt <= airDropModel.effectiveDate
            }
        });

        // All eligible is both time eligible + never received drop before
        // In actuality, never received drop before isn't a case that we should worry about
        const allEligibleUsers = allTimeEligibleUsers.filter(user => {
            return !modelExistsInInternalDB('dropActivity', {
                userID: user.id,
                source: AIR_DROP,
                dropID: airDropModel.id,
            });
        });

        const usersNum = allEligibleUsers.length;
        if (usersNum === 0) {
            throw 'There were exactly 0 users eligible for this drop';
        }

        const userDropAmount = getTokenPerUser(usersNum, airDropModel.numberOfTokens);

        allEligibleUsers.forEach((user) => {
            const tokenObj = (user.tokens ?? []).find(tok => tok.brandID === brand.id) ?? {
                brandID: brand.id,
                balance: 0,
                USDBalance: 0,
                lastUpdated: getTokenAwardDate(),
            };
            tokenObj.balance += userDropAmount;

            upsertModelInInternalDB('userAccount', {
                tokens: [tokenObj, ...(user.tokens ?? []).filter(tok => tok.brandID !== brand.id)]
            }, { id: user.id });

            addModelToInternalDB(`dropActivity`, {
                userID: user.id,
                source: AIR_DROP,
                dropID: airDropModel.id,
            });
        })

        return {
            ...airDropModel,
            eligibleUsers: usersNum,
            tokenPerUser: userDropAmount
        };
    },
};
