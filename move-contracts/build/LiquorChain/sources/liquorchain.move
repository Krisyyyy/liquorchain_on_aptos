module liquorchain::liquorchain {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::timestamp;
    use std::bcs;
    use aptos_token::token::{Self, initialize_token_script, create_collection_script, create_token_script, transfer_with_opt_in, opt_in_direct_transfer};

    struct LiquorMeta has key {
        next_batch_id: u64,
    }

    public entry fun init_store(account: &signer) {
        if (!token::has_token_store(signer::address_of(account))) {
            initialize_token_script(account);
        };
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
    }

    public entry fun mint_batch_nft(
        creator: &signer,
        name: String,
        description: String,
        uri: String,
    ) acquires LiquorMeta {
        init_store(creator);

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
    }

    public entry fun mint_bottle_nft(
        creator: &signer,
        batch_id: u64,
        name: String,
        description: String,
        uri: String,
    ) {
        init_store(creator);

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
}
