describe("Create and Get Air Drop", () => {
    before(() => {
        cy.post('test/clear-db');

        cy.post('admin/seed_data/test').then(res => {
            expect(res.status).to.eq(200);
        });
    });

    it("get airDrop model - should fail", () => {
        cy.post('api/airDrop/get', {
            fakeProperty: "some value"
        }).then(res => {
            expect(res.status).to.eq(500, "wrong status code");
            expect(res.body.error).not.to.eq(undefined);
        });
    });

    it("create airDrop model", ()=>  {
        cy.post('api/airDrop/create', {
            id: "WTF",
            brandID: "1",
            numberOfTokens: 10000,
            effectiveDate: Number.MAX_VALUE
        }).then(res => {
            expect(res.status).to.eq(200, "wrong status code");
            expect(res.body.id).not.to.eq(undefined);
            expect(res.body.id.length).not.to.eq(0);
        });
    });

    it("get airDrop model - should succeed",  ()=>  {
        cy.post('api/airDrop/get', { "id": "WTF" }).then(res => {
            expect(res.status).to.eq(200, "wrong status code");
            expect(res.body.brandID).to.eq("1");
            expect(res.body.id).not.to.eq(undefined);
            expect(res.body.id.length).not.to.eq(0);
            expect(res.body.createdAtFormatted).not.to.eq("");
            expect(res.body.createdAtFormatted).not.to.eq(undefined);
        });
    });

    it('list models - expect one', () =>  {
        cy.post('api/airDrop/list', {}).then(res => {
            expect(res.status).to.eq(200, "wrong status code");
            expect(res.body.length).to.eq(1);
        });
    });

    it("create airDrop model", () =>  {
        cy.post('api/airDrop/create', {
            id: "WTF2",
            brandID: "1",
            numberOfTokens: 20000,
            effectiveDate: Number.MAX_VALUE
        }).then(res => {
            expect(res.status).to.eq(200, "wrong status code");
            expect(res.body.id).not.to.eq(undefined);
            expect(res.body.id.length).not.to.eq(0);
        });
    });

    it('list models - use search params',() =>  {
        cy.post('api/airDrop/list', {
            id: "WTF2",
        }).then(res => {
            expect(res.status).to.eq(200, "wrong status code");
            expect(res.body.length).to.eq(1);
        });
    });

    it('upsert models - should reject',() =>  {
        cy.post('api/airDrop/upsert', {
            id: "WTF2",
        }).then(res => {
            expect(res.status).to.eq(500, "wrong status code");
        });
    });

    it('update models - should reject',() => {
        cy.post('api/airDrop/update', {
            id: "WTF2",
        }).then(res => {
            expect(res.status).to.eq(500, "wrong status code");
        });
    });

    it('create models - no users, should reject',() => {
        cy.post('test/clear-db');

        cy.post('api/airDrop/create', {
            id: "WTF",
            brandID: "1",
            numberOfTokens: 10000,
            effectiveDate: Number.MAX_VALUE
        }).then(res => {
            expect(res.status).to.eq(500, "wrong status code");
        });

    });
});
