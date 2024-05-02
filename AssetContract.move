// Importing necessary modules
address 0x1 {
    module Assets {
        use std::signer;
        use std::option::Option;
        use std::vector::Vector;

        // Struct to represent a physical asset
        struct Asset {
            name: vector<u8>, // Name of the asset
            id: u64, // Unique identifier for the asset
            owner: address, // Current owner of the asset
        }

        // Resource to hold assets owned by an address
        struct AssetsOwned has key {
            assets: vector<Asset>,
        }

        // Resource to keep track of all issued asset IDs to ensure uniqueness
        struct AssetIDTracker has key {
            next_id: u64,
        }

        public fun register_new_asset(owner: &signer, name: vector<u8>) {
            let asset_id = get_next_asset_id();
            let asset = Asset {
                name: name,
                id: asset_id,
                owner: signer::address_of(owner),
            };
            add_asset_to_owner(owner, asset);
        }

        // Transfer ownership of an asset
        public fun transfer_asset(from: &signer, to: address, asset_id: u64) {
            let asset_index_opt = find_asset_index(&borrow_global<AssetsOwned>(signer::address_of(from)).assets, asset_id);
            assert!(Option::is_some(&asset_index_opt), 404, "Asset not found");
            let asset_index = Option::unwrap(asset_index_opt);

            let mut from_assets = borrow_global_mut<AssetsOwned>(signer::address_of(from)).assets;
            let asset = Vector::remove(&mut from_assets, asset_index);
            assert!(asset.owner == signer::address_of(from), 403, "Unauthorized");

            asset.owner = to; // Update the asset's owner to the new owner

            // Add the asset to the new owner's list
            if (!exists<AssetsOwned>(to)) {
                move_to(from, AssetsOwned { assets: Vector::empty() });
            };
            add_asset_to_owner(&Signer::borrow_address(to), asset);
        }

        // Function to retrieve the asset owned by a user
        public fun get_assets_owned_by(address: address): vector<Asset> acquires AssetsOwned {
            if (exists<AssetsOwned>(address)) {
                return *borrow_global<AssetsOwned>(address).assets;
            } else {
                return Vector::empty();
            }
        }

        // Helper function to add an asset to an owner's collection
        fun add_asset_to_owner(owner: &signer, asset: Asset) {
            if (!exists<AssetsOwned>(signer::address_of(owner))) {
                move_to(owner, AssetsOwned { assets: Vector::empty() });
            };
            let owner_assets = borrow_global_mut<AssetsOwned>(signer::address_of(owner));
            Vector::push_back(&mut owner_assets.assets, asset);
        }

        // Helper function to get the next unique asset ID
        fun get_next_asset_id(): u64 {
            let id_tracker = if (exists<AssetIDTracker>(@0x1)) {
                borrow_global_mut<AssetIDTracker>(@0x1)
            } else {
                move_to(@0x1, AssetIDTracker { next_id: 1 });
                borrow_global_mut<AssetIDTracker>(@0x1)
            };
            let id = id_tracker.next_id;
            id_tracker.next_id = id + 1;
            id
        }

        // Helper function to find the index of an asset in an owner's asset list
        fun find_asset_index(assets: &vector<Asset>, asset_id: u64): Option<u64> {
            let len = Vector::length(assets);
            let mut index: u64 = 0;

            while (index < len) {
                if (Vector::borrow(assets, index).id == asset_id) {
                    return Option::some(index);
                };
                index = index + 1;
            };
            Option::none()
        }
    }
}