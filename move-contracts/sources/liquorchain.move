module liquorchain::liquorchain {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::timestamp;
    
    
    use std::bcs;
    use aptos_token::token::{create_collection_script, create_token_script, transfer_with_opt_in, opt_in_direct_transfer};

    struct LiquorMeta has key {
        next_batch_id: u64,
    }

    struct MemberRoles has key {
        roles: vector<String>,
    }

    struct BatchRecord has store, copy, drop {
        id: u64,
        name: String,
        description: String,
        uri: String,
        creator: address,
        ts: u64,
    }

    struct BottleRecord has store, copy, drop {
        id: u64,
        batch_id: u64,
        name: String,
        description: String,
        uri: String,
        creator: address,
        ts: u64,
    }

    struct DeliveryRecord has store, copy, drop {
        id: u64,
        from: address,
        to: address,
        batch_id: u64,
        ts: u64,
    }

    struct Attestation has store, copy, drop {
        id: u64,
        batch_id: u64,
        regulator: address,
        standard: String,
        date: u64,
        valid: bool,
    }

    struct BatchStore has key {
        records: vector<BatchRecord>,
    }

    struct BottleStore has key {
        records: vector<BottleRecord>,
        next_bottle_id: u64,
    }

    struct DeliveryStore has key {
        records: vector<DeliveryRecord>,
        next_delivery_id: u64,
    }

    struct AttestationStore has key {
        records: vector<Attestation>,
        next_attestation_id: u64,
    }

    

    

    

    public entry fun create_collection(creator: &signer) {
        let mutate = vector::empty<bool>();
        vector::push_back(&mut mutate, false);
        vector::push_back(&mut mutate, false);
        vector::push_back(&mut mutate, false);

        create_collection_script(
            creator,
            string::utf8(b"LiquorChain Collection"),
            string::utf8(b"LiquorChain batch & bottle NFTs"),
            string::utf8(b"https://example.com/liquorchain"),
            0,
            mutate,
        );

        if (!exists<LiquorMeta>(signer::address_of(creator))) {
            move_to(creator, LiquorMeta { next_batch_id: 1 });
        };

        let addr = signer::address_of(creator);
        if (!exists<BatchStore>(addr)) {
            move_to(creator, BatchStore { records: vector::empty<BatchRecord>() });
        };
        if (!exists<BottleStore>(addr)) {
            move_to(creator, BottleStore { records: vector::empty<BottleRecord>(), next_bottle_id: 1 });
        };
        if (!exists<DeliveryStore>(addr)) {
            move_to(creator, DeliveryStore { records: vector::empty<DeliveryRecord>(), next_delivery_id: 1 });
        };
        if (!exists<AttestationStore>(addr)) {
            move_to(creator, AttestationStore { records: vector::empty<Attestation>(), next_attestation_id: 1 });
        };
        
    }

    public entry fun mint_batch_nft(
        creator: &signer,
        name: String,
        description: String,
        uri: String,
    ) acquires LiquorMeta, BatchStore {

        let addr = signer::address_of(creator);
        let meta = borrow_global_mut<LiquorMeta>(addr);
        let batch_id = meta.next_batch_id;

        let keys = vector::empty<String>();
        let types = vector::empty<String>();
        let values = vector::empty<vector<u8>>();

        vector::push_back(&mut keys, string::utf8(b"token_type"));
        vector::push_back(&mut types, string::utf8(b"string"));
        vector::push_back(&mut values, b"batch");

        vector::push_back(&mut keys, string::utf8(b"origin"));
        vector::push_back(&mut types, string::utf8(b"string"));
        vector::push_back(&mut values, b"Unknown");

        vector::push_back(&mut keys, string::utf8(b"batch_id"));
        vector::push_back(&mut types, string::utf8(b"u64"));
        vector::push_back(&mut values, bcs::to_bytes(&batch_id));

        let ts = timestamp::now_seconds();
        vector::push_back(&mut keys, string::utf8(b"production_timestamp"));
        vector::push_back(&mut types, string::utf8(b"u64"));
        vector::push_back(&mut values, bcs::to_bytes(&ts));

        vector::push_back(&mut keys, string::utf8(b"producer_address"));
        vector::push_back(&mut types, string::utf8(b"address"));
        vector::push_back(&mut values, bcs::to_bytes(&addr));

        let mutate_setting = vector::empty<bool>();
        vector::push_back(&mut mutate_setting, false);
        vector::push_back(&mut mutate_setting, false);
        vector::push_back(&mut mutate_setting, false);
        vector::push_back(&mut mutate_setting, false);
        vector::push_back(&mut mutate_setting, false);

        create_token_script(
            creator,
            string::utf8(b"LiquorChain Collection"),
            name,
            description,
            1,
            1,
            uri,
            addr,
            100,
            5,
            mutate_setting,
            keys,
            values,
            types,
        );

        meta.next_batch_id = batch_id + 1;

        let store = borrow_global_mut<BatchStore>(addr);
        let ts2 = timestamp::now_seconds();
        let rec = BatchRecord { id: batch_id, name, description, uri, creator: addr, ts: ts2 };
        vector::push_back(&mut store.records, rec);

        
    }

    public entry fun mint_bottle_nft(
        creator: &signer,
        batch_id: u64,
        name: String,
        description: String,
        uri: String,
    ) acquires BottleStore {

        let addr = signer::address_of(creator);

        let keys = vector::empty<String>();
        let types = vector::empty<String>();
        let values = vector::empty<vector<u8>>();

        vector::push_back(&mut keys, string::utf8(b"token_type"));
        vector::push_back(&mut types, string::utf8(b"string"));
        vector::push_back(&mut values, b"bottle");

        vector::push_back(&mut keys, string::utf8(b"batch_id"));
        vector::push_back(&mut types, string::utf8(b"u64"));
        vector::push_back(&mut values, bcs::to_bytes(&batch_id));

        vector::push_back(&mut keys, string::utf8(b"producer_address"));
        vector::push_back(&mut types, string::utf8(b"address"));
        vector::push_back(&mut values, bcs::to_bytes(&addr));

        let mutate_setting = vector::empty<bool>();
        vector::push_back(&mut mutate_setting, false);
        vector::push_back(&mut mutate_setting, false);
        vector::push_back(&mut mutate_setting, false);
        vector::push_back(&mut mutate_setting, false);
        vector::push_back(&mut mutate_setting, false);

        create_token_script(
            creator,
            string::utf8(b"LiquorChain Collection"),
            name,
            description,
            1,
            1,
            uri,
            addr,
            100,
            5,
            mutate_setting,
            keys,
            values,
            types,
        );

        let store = borrow_global_mut<BottleStore>(addr);
        let ts2 = timestamp::now_seconds();
        let bid = store.next_bottle_id;
        let rec = BottleRecord { id: bid, batch_id, name, description, uri, creator: addr, ts: ts2 };
        vector::push_back(&mut store.records, rec);
        store.next_bottle_id = bid + 1;

        
    }

    public entry fun opt_in_transfer(account: &signer) {
        opt_in_direct_transfer(account, true);
    }

    public entry fun transfer_token(
        sender: &signer,
        recipient: address,
        creator: address,
        collection_name: String,
        token_name: String,
        property_version: u64,
        amount: u64,
    ) {
        transfer_with_opt_in(
            sender,
            creator,
            collection_name,
            token_name,
            property_version,
            recipient,
            amount,
        );
    }

    public entry fun set_member_roles(account: &signer, roles: vector<String>) {
        let addr = signer::address_of(account);
        if (exists<MemberRoles>(addr)) {
            let m = borrow_global_mut<MemberRoles>(addr);
            m.roles = roles;
        } else {
            move_to(account, MemberRoles { roles });
        };
    }

    public fun get_member_roles(addr: address): vector<String> acquires MemberRoles {
        if (exists<MemberRoles>(addr)) {
            let m = borrow_global<MemberRoles>(addr);
            m.roles
        } else {
            vector::empty<String>()
        }
    }

    public entry fun create_delivery(sender: &signer, to: address, batch_id: u64) acquires DeliveryStore {
        let addr = signer::address_of(sender);
        let s = borrow_global_mut<DeliveryStore>(addr);
        let id = s.next_delivery_id;
        let ts2 = timestamp::now_seconds();
        let rec = DeliveryRecord { id, from: addr, to, batch_id, ts: ts2 };
        vector::push_back(&mut s.records, rec);
        s.next_delivery_id = id + 1;
    }

    public fun delivery_count(addr: address): u64 acquires DeliveryStore {
        let s = borrow_global<DeliveryStore>(addr);
        vector::length(&s.records)
    }

    public fun delivery_by_index(addr: address, i: u64): DeliveryRecord acquires DeliveryStore {
        let s = borrow_global<DeliveryStore>(addr);
        *vector::borrow(&s.records, i)
    }

    public entry fun add_attestation(regulator: &signer, batch_id: u64, standard: String, valid: bool) acquires AttestationStore {
        let addr = signer::address_of(regulator);
        let s = borrow_global_mut<AttestationStore>(addr);
        let id = s.next_attestation_id;
        let date = timestamp::now_seconds();
        let a = Attestation { id, batch_id, regulator: addr, standard, date, valid };
        vector::push_back(&mut s.records, a);
        s.next_attestation_id = id + 1;
        
    }

    public fun attestation_count(addr: address): u64 acquires AttestationStore {
        let s = borrow_global<AttestationStore>(addr);
        vector::length(&s.records)
    }

    public fun attestation_by_index(addr: address, i: u64): Attestation acquires AttestationStore {
        let s = borrow_global<AttestationStore>(addr);
        *vector::borrow(&s.records, i)
    }

    public fun batch_count(addr: address): u64 acquires BatchStore {
        let s = borrow_global<BatchStore>(addr);
        vector::length(&s.records)
    }

    public fun batch_by_index(addr: address, i: u64): BatchRecord acquires BatchStore {
        let s = borrow_global<BatchStore>(addr);
        *vector::borrow(&s.records, i)
    }

    public fun bottle_count(addr: address): u64 acquires BottleStore {
        let s = borrow_global<BottleStore>(addr);
        vector::length(&s.records)
    }

    public fun bottle_by_index(addr: address, i: u64): BottleRecord acquires BottleStore {
        let s = borrow_global<BottleStore>(addr);
        *vector::borrow(&s.records, i)
    }

    public entry fun mint_qr_nft(creator: &signer, name: String, description: String, uri: String) {
        let addr = signer::address_of(creator);
        let keys = vector::empty<String>();
        let types = vector::empty<String>();
        let values = vector::empty<vector<u8>>();
        vector::push_back(&mut keys, string::utf8(b"token_type"));
        vector::push_back(&mut types, string::utf8(b"string"));
        vector::push_back(&mut values, b"qr_code");
        create_token_script(
            creator,
            string::utf8(b"LiquorChain Collection"),
            name,
            description,
            1,
            1,
            uri,
            addr,
            100,
            5,
            vector::empty<bool>(),
            keys,
            values,
            types,
        );
    }
}
